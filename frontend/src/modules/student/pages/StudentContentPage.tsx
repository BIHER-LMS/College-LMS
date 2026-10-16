import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  FileText,
  Video,
  FileCode,
  Download,
  CheckCircle,
  X,
  ExternalLink,
  Loader2,
  Check,
  Clock,
} from 'lucide-react';
import { studentApi } from '../api/studentApi';
import { downloadFileWithGuaranteedName } from '../../../utils/fileDownload';
import { MarkdownViewer } from '../../../components/MarkdownViewer';

declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

const YoutubeIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" fill="currentColor">
    <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.5 12 3.5 12 3.5s-7.505 0-9.377.55a3.016 3.016 0 0 0-2.122 2.136C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.55 9.376.55 9.376.55s7.505 0 9.377-.55a3.016 3.016 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
  </svg>
);

export const StudentContentPage: React.FC = () => {
  const [subjects, setSubjects] = useState<any[]>([]);
  const [selectedSubjectId, setSelectedSubjectId] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Active Viewing Content State
  const [activeContent, setActiveContent] = useState<any>(null);
  const [activeContentLoading, setActiveContentLoading] = useState<boolean>(false);
  const [isPreviewModalOpen, setIsPreviewModalOpen] = useState<boolean>(false);
  const [viewerEngine, setViewerEngine] = useState<'office' | 'google'>('office');

  // Video / YouTube Telemetry Tracking State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const ytPlayerRef = useRef<any>(null);
  const [lastTrackedTime, setLastTrackedTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const heartbeatTimerRef = useRef<any>(null);
  const readingTimerRef = useRef<any>(null);
  const [readingSessionSeconds, setReadingSessionSeconds] = useState<number>(0);

  useEffect(() => {
    loadLearningMaterials();
  }, []);

  const loadLearningMaterials = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getLearningContents();
      setSubjects(data || []);
      if (data && data.length > 0 && !selectedSubjectId) {
        setSelectedSubjectId(data[0].classSubjectId);
      }
    } catch (err) {
      console.error('Failed to load student learning materials:', err);
    } finally {
      setLoading(false);
    }
  };

  /**
   * Fast In-App Content Opener:
   * Instantly initializes the viewer from in-memory content data so the modal opens with zero delay,
   * while asynchronously recording the VIEW event and syncing server progress in the background.
   */
  const handleOpenContent = async (item: any, topic?: any) => {
    const selectedSub = subjects.find((s) => s.classSubjectId === selectedSubjectId);

    const initialContent = {
      ...item,
      contentType: item.contentType || item.content_type,
      topic: item.topic || topic || { title: topic?.title || 'Learning Topic' },
      classSubject: item.classSubject || {
        subjectName: selectedSub?.subject?.name || selectedSub?.subjectName || 'Course',
        subjectCode: selectedSub?.subject?.code || selectedSub?.subjectCode || '',
      },
      progress: item.progress || null,
    };

    setActiveContent(initialContent);
    setCurrentProgress(initialContent.progress);
    setLastTrackedTime(initialContent.progress?.lastPositionSeconds || 0);
    setReadingSessionSeconds(0);
    setActiveContentLoading(false);
    setIsPreviewModalOpen(true);

    // Asynchronously log the initial VIEW event & fetch fresh progress without blocking the UI
    try {
      const freshContent = await studentApi.getContentDetails(item.id);
      if (freshContent) {
        setActiveContent((prev: any) => ({
          ...prev,
          ...freshContent,
          topic: freshContent.topic || prev?.topic,
          classSubject: freshContent.classSubject || prev?.classSubject,
        }));
        if (freshContent.progress) {
          setCurrentProgress(freshContent.progress);
          setLastTrackedTime(freshContent.progress.lastPositionSeconds || 0);
        }
      }
    } catch (err) {
      console.warn('Background sync for content progress:', err);
    }
  };

  const handleCloseContent = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
      heartbeatTimerRef.current = null;
    }
    if (readingTimerRef.current) {
      clearInterval(readingTimerRef.current);
      readingTimerRef.current = null;
    }
    if (ytPlayerRef.current) {
      try {
        ytPlayerRef.current.destroy();
      } catch (e) {}
      ytPlayerRef.current = null;
    }
    setIsPreviewModalOpen(false);
    setActiveContent(null);
    loadLearningMaterials(); // Refresh progress badges
  };

  // Video Heartbeat & Event Dispatcher
  const logVideoEvent = async (
    eventType: string,
    currentPos: number,
    duration: number,
    extra: Record<string, any> = {}
  ) => {
    if (!activeContent) return;
    try {
      const res = await studentApi.recordLearningEvent(activeContent.id, {
        eventType,
        positionSeconds: currentPos,
        durationSeconds: duration,
        playbackRate: playbackSpeed,
        ...extra,
      });
      const updatedProgress = (res as any)?.data || res;
      if (updatedProgress) {
        setCurrentProgress((prev: any) => ({
          ...(prev || {}),
          ...updatedProgress,
        }));
      }
    } catch (err) {
      console.warn('Telemetry event failed:', err);
    }
  };

  // -------------------------------------------------------------
  // YOUTUBE IFRAME PLAYER API INTEGRATION (Full Telemetry Tracking)
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isPreviewModalOpen || activeContent?.contentType !== 'YOUTUBE' || !activeContent?.youtubeVideoId) {
      return;
    }

    let isMounted = true;

    const initYouTubePlayer = () => {
      if (!isMounted) return;
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }

      const container = document.getElementById('youtube-player-container');
      if (!container || !window.YT || !window.YT.Player) return;

      try {
        ytPlayerRef.current = new window.YT.Player('youtube-player-container', {
          videoId: activeContent.youtubeVideoId,
          playerVars: {
            autoplay: 1,
            enablejsapi: 1,
            origin: window.location.origin,
            rel: 0,
            modestbranding: 1,
          },
          events: {
            onReady: (event: any) => {
              if (!isMounted) return;
              const resumePos = activeContent?.progress?.lastPositionSeconds || 0;
              if (resumePos > 0) {
                event.target.seekTo(resumePos, true);
              }
            },
            onStateChange: (event: any) => {
              if (!isMounted) return;
              handleYouTubeStateChange(event.data);
            },
          },
        });
      } catch (err) {
        console.error('Failed to instantiate YouTube player:', err);
      }
    };

    const handleYouTubeStateChange = (state: number) => {
      // 1 = PLAYING, 2 = PAUSED, 0 = ENDED
      if (state === 1) {
        const currTime = ytPlayerRef.current?.getCurrentTime?.() || 0;
        const dur = ytPlayerRef.current?.getDuration?.() || activeContent.durationSeconds || 600;
        logVideoEvent('PLAY', currTime, dur);

        if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = setInterval(() => {
          if (ytPlayerRef.current && typeof ytPlayerRef.current.getCurrentTime === 'function') {
            const t = ytPlayerRef.current.getCurrentTime();
            const d = ytPlayerRef.current.getDuration() || dur;
            logVideoEvent('TIME_UPDATE', t, d, { deltaWatchSeconds: 5 });
          }
        }, 5000);
      } else if (state === 2) {
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        const currTime = ytPlayerRef.current?.getCurrentTime?.() || 0;
        const dur = ytPlayerRef.current?.getDuration?.() || 0;
        logVideoEvent('PAUSE', currTime, dur);
      } else if (state === 0) {
        if (heartbeatTimerRef.current) {
          clearInterval(heartbeatTimerRef.current);
          heartbeatTimerRef.current = null;
        }
        const dur = ytPlayerRef.current?.getDuration?.() || activeContent.durationSeconds || 600;
        logVideoEvent('COMPLETE', dur, dur);
        setCurrentProgress((prev: any) => ({
          ...(prev || {}),
          completionPercentage: 100,
          isCompleted: true,
        }));
      }
    };

    if (window.YT && window.YT.Player) {
      initYouTubePlayer();
    } else {
      if (!document.getElementById('youtube-iframe-api-script')) {
        const tag = document.createElement('script');
        tag.id = 'youtube-iframe-api-script';
        tag.src = 'https://www.youtube.com/iframe_api';
        const firstScript = document.getElementsByTagName('script')[0];
        firstScript?.parentNode?.insertBefore(tag, firstScript);
      }

      const prevCallback = window.onYouTubeIframeAPIReady;
      window.onYouTubeIframeAPIReady = () => {
        if (prevCallback) prevCallback();
        initYouTubePlayer();
      };

      const pollYT = setInterval(() => {
        if (window.YT && window.YT.Player) {
          clearInterval(pollYT);
          initYouTubePlayer();
        }
      }, 200);

      return () => {
        isMounted = false;
        clearInterval(pollYT);
      };
    }

    return () => {
      isMounted = false;
      if (heartbeatTimerRef.current) {
        clearInterval(heartbeatTimerRef.current);
        heartbeatTimerRef.current = null;
      }
      if (ytPlayerRef.current) {
        try {
          ytPlayerRef.current.destroy();
        } catch (e) {}
        ytPlayerRef.current = null;
      }
    };
  }, [isPreviewModalOpen, activeContent?.id, activeContent?.youtubeVideoId]);

  // -------------------------------------------------------------
  // DOCUMENT (PDF / PPT / DOC / MARKDOWN) IN-APP READING TRACKING
  // -------------------------------------------------------------
  useEffect(() => {
    if (!isPreviewModalOpen || !activeContent) return;
    const isDoc = ['PDF', 'PPT', 'DOC', 'MARKDOWN'].includes(activeContent.contentType);
    if (!isDoc) return;

    if (readingTimerRef.current) clearInterval(readingTimerRef.current);

    // Track in-app reading engagement every 15 seconds
    readingTimerRef.current = setInterval(() => {
      setReadingSessionSeconds((prev) => {
        const next = prev + 15;
        logVideoEvent('TIME_UPDATE', next, activeContent.durationSeconds || 300, {
          deltaWatchSeconds: 15,
          readingTimeSeconds: next,
        });
        return next;
      });
    }, 15000);

    return () => {
      if (readingTimerRef.current) {
        clearInterval(readingTimerRef.current);
        readingTimerRef.current = null;
      }
    };
  }, [isPreviewModalOpen, activeContent?.id]);

  const handleMarkAsCompleted = async () => {
    if (!activeContent) return;
    await logVideoEvent('COMPLETE', 100, 100);
    setCurrentProgress((prev: any) => ({
      ...(prev || {}),
      completionPercentage: 100,
      isCompleted: true,
    }));
  };

  // HTML5 Video Playback Listeners
  const onVideoPlay = () => {
    if (!videoRef.current) return;
    logVideoEvent('PLAY', videoRef.current.currentTime, videoRef.current.duration);

    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    heartbeatTimerRef.current = setInterval(() => {
      if (videoRef.current && !videoRef.current.paused) {
        logVideoEvent(
          'TIME_UPDATE',
          videoRef.current.currentTime,
          videoRef.current.duration,
          { deltaWatchSeconds: 5 }
        );
      }
    }, 5000);
  };

  const onVideoPause = () => {
    if (!videoRef.current) return;
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    logVideoEvent('PAUSE', videoRef.current.currentTime, videoRef.current.duration);
  };

  const onVideoSeeked = () => {
    if (!videoRef.current) return;
    const newTime = videoRef.current.currentTime;
    const isRewind = newTime < lastTrackedTime;
    const eventType = isRewind ? 'REWIND' : 'SEEK';

    logVideoEvent(eventType, newTime, videoRef.current.duration, {
      seekFrom: lastTrackedTime,
      seekTo: newTime,
    });
    setLastTrackedTime(newTime);
  };

  const onVideoEnded = () => {
    if (!videoRef.current) return;
    if (heartbeatTimerRef.current) clearInterval(heartbeatTimerRef.current);
    logVideoEvent('COMPLETE', videoRef.current.duration, videoRef.current.duration);
    setCurrentProgress((prev: any) => ({
      ...(prev || {}),
      completionPercentage: 100,
      isCompleted: true,
    }));
  };

  const onVideoLoadedMetadata = () => {
    if (videoRef.current && activeContent?.progress?.lastPositionSeconds > 0) {
      videoRef.current.currentTime = activeContent.progress.lastPositionSeconds;
    }
  };

  // Speed Change for both HTML5 and YouTube
  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
    if (ytPlayerRef.current && typeof ytPlayerRef.current.setPlaybackRate === 'function') {
      try {
        ytPlayerRef.current.setPlaybackRate(speed);
      } catch (e) {}
    }
  };

  // Download Handler with guaranteed filename preservation
  const handleDownload = async (contentId: string) => {
    try {
      const res = await studentApi.getAuthorizedDownload(contentId);
      const downloadData = (res as any)?.data || res;
      if (downloadData.fileUrl) {
        await downloadFileWithGuaranteedName(
          downloadData.fileUrl,
          downloadData.fileName || 'learning-material'
        );
      }
    } catch (err: any) {
      alert(err.message || 'Download not authorized or unavailable.');
    }
  };

  const selectedSubject = subjects.find((s) => s.classSubjectId === selectedSubjectId);

  const getContentIcon = (type: string) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-500" />;
      case 'PPT':
        return <FileText className="w-5 h-5 text-amber-500" />;
      case 'DOC':
        return <FileText className="w-5 h-5 text-blue-500" />;
      case 'MARKDOWN':
        return <FileCode className="w-5 h-5 text-emerald-500" />;
      case 'VIDEO':
        return <Video className="w-5 h-5 text-indigo-500" />;
      case 'YOUTUBE':
        return <YoutubeIcon className="w-5 h-5 text-red-600" />;
      default:
        return <BookOpen className="w-5 h-5 text-slate-500" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[500px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 bg-indigo-50 text-indigo-600 rounded-lg">
              <BookOpen className="w-5 h-5" />
            </span>
            <h1 className="text-2xl font-bold text-slate-900 tracking-tight">
              Learning Materials & Lectures
            </h1>
          </div>
          <p className="text-sm text-slate-500 mt-1">
            Access lecture slides, interactive video lectures, notes, and authorized downloads.
          </p>
        </div>

        {/* Subject Tabs */}
        {subjects.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto max-w-full">
            {subjects.map((s) => (
              <button
                key={s.classSubjectId}
                onClick={() => setSelectedSubjectId(s.classSubjectId)}
                className={`px-4 py-2 rounded-xl text-xs font-semibold whitespace-nowrap transition border ${
                  selectedSubjectId === s.classSubjectId
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100'
                }`}
              >
                {s.subject?.name || s.subjectName || 'Course'} ({s.overallCompletionRate || 0}%)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Subject Overview Banner */}
      {selectedSubject && (
        <div className="bg-slate-900 text-white p-6 rounded-2xl border border-slate-800 shadow-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-xs font-bold uppercase tracking-wider mb-1">
              <span>{selectedSubject.subject?.code || 'COURSE'}</span>
              <span>•</span>
              <span>{selectedSubject.subject?.credits || 3} CREDITS</span>
            </div>
            <h2 className="text-xl font-bold text-white">
              {selectedSubject.subject?.name || selectedSubject.subjectName}
            </h2>
            <p className="text-xs text-slate-400 mt-0.5">
              Faculty: {selectedSubject.faculty?.displayName || 'Department Faculty'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-slate-800/80 px-4 py-3 rounded-xl border border-slate-700">
            <div>
              <span className="block text-[10px] uppercase font-bold text-slate-400">
                Course Completion
              </span>
              <span className="text-lg font-black text-indigo-300">
                {selectedSubject.overallCompletionRate || 0}%
              </span>
            </div>
            <div className="w-24 h-2 bg-slate-700 rounded-full overflow-hidden">
              <div
                className="h-full bg-emerald-500 rounded-full transition-all duration-500"
                style={{ width: `${selectedSubject.overallCompletionRate || 0}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Topics & Content Listing */}
      {!selectedSubject || !selectedSubject.topics || selectedSubject.topics.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-dashed border-slate-300 p-8">
          <BookOpen className="w-12 h-12 text-slate-400 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-800">No Learning Topics Published Yet</h3>
          <p className="text-sm text-slate-500 max-w-md mx-auto mt-1">
            Your instructor has not published any lecture slides or video topics for this subject yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedSubject.topics.map((topic: any, idx: number) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl border border-slate-200/80 shadow-xs overflow-hidden"
            >
              {/* Topic Header */}
              <div className="p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
                <div className="flex items-center gap-3">
                  <span className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs">
                    {idx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{topic.description}</p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                  {topic.contents?.length || 0} {(topic.contents?.length || 0) === 1 ? 'Resource' : 'Resources'}
                </span>
              </div>

              {/* Contents in topic */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topic.contents?.map((item: any) => {
                  const isCompleted = item.progress?.isCompleted;
                  const progressPct = item.progress?.completionPercentage || 0;

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition bg-white group cursor-pointer"
                      onClick={() => handleOpenContent(item, topic)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 transition">
                            {getContentIcon(item.contentType || item.content_type)}
                          </div>

                          <div className="flex items-center gap-1.5">
                            {isCompleted ? (
                              <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                                <CheckCircle className="w-3 h-3" />
                                Completed
                              </span>
                            ) : progressPct > 0 ? (
                              <span className="text-[11px] font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                                {progressPct}% In Progress
                              </span>
                            ) : (
                              <span className="text-[11px] font-medium text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">
                                Not Started
                              </span>
                            )}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-slate-900 group-hover:text-indigo-600 transition line-clamp-1">
                          {item.title}
                        </h4>
                        {item.description && (
                          <p className="text-xs text-slate-500 mt-1 line-clamp-2">{item.description}</p>
                        )}
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs text-slate-400">
                        <span className="uppercase font-semibold tracking-wider text-[10px] text-slate-500">
                          {item.contentType || item.content_type}
                        </span>

                        <div className="flex items-center gap-2">
                          {(item.isDownloadable || item.is_downloadable) && item.fileUrl && (
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleDownload(item.id);
                              }}
                              className="p-1.5 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition"
                              title="Download Material"
                            >
                              <Download className="w-4 h-4" />
                            </button>
                          )}
                          <span className="text-indigo-600 font-semibold group-hover:translate-x-0.5 transition">
                            Open &rarr;
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* ========================================================= */}
      {/* IN-APP PREVIEW & VIDEO PLAYER MODAL (Fast & Telemetry Ready) */}
      {/* ========================================================= */}
      {isPreviewModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-2 sm:p-4">
          <div className="bg-white rounded-2xl max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl border border-slate-200 overflow-hidden">
            {/* Modal Header */}
            <div className="p-4 bg-slate-900 text-white flex items-center justify-between border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-white/10 rounded-lg">
                  {activeContent && getContentIcon(activeContent.contentType)}
                </div>
                <div>
                  <h3 className="text-sm font-bold truncate max-w-md">
                    {activeContent?.title || 'Loading content...'}
                  </h3>
                  <span className="text-xs text-slate-400">
                    {activeContent?.topic?.title} • {activeContent?.classSubject?.subjectName || 'Course'}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 sm:gap-3">
                {/* Engine switcher for Office & PPT documents */}
                {(activeContent?.contentType === 'PPT' || activeContent?.contentType === 'DOC') && (
                  <div className="hidden sm:flex items-center bg-slate-800 rounded-lg p-0.5 border border-slate-700 text-xs">
                    <button
                      type="button"
                      onClick={() => setViewerEngine('office')}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        viewerEngine === 'office'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Use Microsoft Office Online Viewer"
                    >
                      Office Online
                    </button>
                    <button
                      type="button"
                      onClick={() => setViewerEngine('google')}
                      className={`px-2.5 py-1 rounded-md font-medium transition ${
                        viewerEngine === 'google'
                          ? 'bg-indigo-600 text-white shadow-xs'
                          : 'text-slate-400 hover:text-white'
                      }`}
                      title="Use Google Docs Viewer"
                    >
                      Google Docs
                    </button>
                  </div>
                )}

                {activeContent?.isDownloadable && activeContent?.fileUrl && (
                  <button
                    onClick={() => handleDownload(activeContent.id)}
                    className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold px-3 py-1.5 rounded-lg shadow-xs transition"
                    title="Download original file"
                  >
                    <Download className="w-3.5 h-3.5" />
                    <span>Download</span>
                  </button>
                )}

                <button
                  onClick={handleCloseContent}
                  className="p-1.5 text-slate-400 hover:text-white rounded-lg hover:bg-white/10 transition"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Modal Viewer Body */}
            <div className="flex-1 bg-slate-950 overflow-auto flex items-center justify-center relative">
              {activeContentLoading ? (
                <div className="flex items-center text-white gap-3">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-400" />
                  <span>Loading resource...</span>
                </div>
              ) : activeContent ? (
                <>
                  {/* VIDEO PLAYER (Direct Upload MP4 / WebM with Telemetry) */}
                  {activeContent.contentType === 'VIDEO' && activeContent.fileUrl && (
                    <div className="w-full h-full flex flex-col justify-center items-center p-4">
                      <video
                        ref={videoRef}
                        src={activeContent.fileUrl}
                        controls
                        controlsList="nodownload"
                        className="max-h-[70vh] w-auto max-w-full rounded-xl shadow-2xl bg-black"
                        onPlay={onVideoPlay}
                        onPause={onVideoPause}
                        onSeeked={onVideoSeeked}
                        onEnded={onVideoEnded}
                        onLoadedMetadata={onVideoLoadedMetadata}
                      />

                      {/* Video Player Controls Bar */}
                      <div className="w-full max-w-xl mt-4 bg-slate-900/90 text-white p-3 rounded-xl border border-slate-800 flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold">Speed:</span>
                          {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleChangeSpeed(s)}
                              className={`px-2 py-1 rounded font-bold transition ${
                                playbackSpeed === s
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-400 hover:text-white'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>

                        {currentProgress && (
                          <div className="flex items-center gap-2 text-slate-300">
                            <span>Watch: {Math.round((currentProgress.watchTimeSeconds || currentProgress.watch_time_seconds || 0) / 60)}m</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">
                              {currentProgress.completionPercentage || currentProgress.completion_percentage || 0}% Done
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* YOUTUBE EMBED PLAYER (Full Telemetry Tracking via YouTube IFrame API) */}
                  {activeContent.contentType === 'YOUTUBE' && (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black relative">
                        <div id="youtube-player-container" className="w-full h-full" />
                      </div>

                      {/* Interactive YouTube Telemetry Controls & Progress Bar */}
                      <div className="w-full max-w-4xl mt-3 bg-slate-900/90 text-white p-3 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-3 text-xs">
                        <div className="flex items-center gap-2">
                          <span className="text-slate-400 font-semibold">Speed:</span>
                          {[0.75, 1.0, 1.25, 1.5, 2.0].map((s) => (
                            <button
                              key={s}
                              onClick={() => handleChangeSpeed(s)}
                              className={`px-2.5 py-1 rounded-lg font-bold transition ${
                                playbackSpeed === s
                                  ? 'bg-indigo-600 text-white'
                                  : 'text-slate-400 hover:text-white bg-slate-800'
                              }`}
                            >
                              {s}x
                            </button>
                          ))}
                        </div>

                        <div className="flex items-center gap-4 text-slate-300">
                          <div className="flex items-center gap-1.5">
                            <Clock className="w-3.5 h-3.5 text-indigo-400" />
                            <span>
                              Watch Time: {Math.round((currentProgress?.watchTimeSeconds || currentProgress?.watch_time_seconds || 0) / 60)} mins
                            </span>
                          </div>

                          <div className="flex items-center gap-1.5 font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                            <Check className="w-3.5 h-3.5" />
                            <span>
                              {currentProgress?.isCompleted || currentProgress?.is_completed
                                ? 'Completed (100%)'
                                : `${currentProgress?.completionPercentage || currentProgress?.completion_percentage || 0}% Progress`}
                            </span>
                          </div>

                          {!(currentProgress?.isCompleted || currentProgress?.is_completed) && (
                            <button
                              onClick={handleMarkAsCompleted}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white px-3 py-1 rounded-lg font-semibold transition"
                            >
                              Mark Complete
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* PDF PREVIEWER */}
                  {activeContent.contentType === 'PDF' && activeContent.fileUrl && (
                    <div className="w-full h-full flex flex-col bg-slate-900">
                      <div className="flex-1 w-full bg-slate-900 flex items-center justify-center relative">
                        <iframe
                          src={`${activeContent.fileUrl}#toolbar=1`}
                          title={activeContent.title}
                          className="w-full h-full border-0 bg-white"
                        />
                      </div>

                      {/* PDF Reading Controls Bar */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-2 text-slate-400">
                          <Clock className="w-4 h-4 text-indigo-400" />
                          <span>Reading Session: {Math.round(readingSessionSeconds / 60)} mins active</span>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className={`font-bold px-2 py-1 rounded ${
                            currentProgress?.isCompleted || currentProgress?.is_completed
                              ? 'text-emerald-400 bg-emerald-950/60'
                              : 'text-indigo-400 bg-indigo-950/60'
                          }`}>
                            {currentProgress?.isCompleted || currentProgress?.is_completed ? 'Completed' : 'Reviewing Material'}
                          </span>
                          {!(currentProgress?.isCompleted || currentProgress?.is_completed) && (
                            <button
                              onClick={handleMarkAsCompleted}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Mark as Read & Completed
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* OFFICE DOCUMENTS (PPT, PPTX, DOC, DOCX - In-App Embedded Viewer) */}
                  {(activeContent.contentType === 'PPT' || activeContent.contentType === 'DOC') && (
                    <div className="w-full h-full flex flex-col bg-slate-900">
                      <div className="flex-1 w-full bg-slate-950 flex flex-col items-center justify-center relative">
                        <iframe
                          src={
                            viewerEngine === 'office'
                              ? `https://view.officeapps.live.com/op/embed.aspx?src=${encodeURIComponent(
                                  activeContent.fileUrl
                                )}`
                              : `https://docs.google.com/viewer?url=${encodeURIComponent(
                                  activeContent.fileUrl
                                )}&embedded=true`
                          }
                          title={activeContent.title}
                          className="w-full h-full border-0 bg-white"
                        />
                      </div>

                      {/* Office Document Engagement & Action Bar */}
                      <div className="p-3 bg-slate-900 border-t border-slate-800 flex items-center justify-between text-xs text-white">
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 flex items-center gap-1.5">
                            <Clock className="w-4 h-4 text-amber-400" />
                            Viewing In-App: {Math.round(readingSessionSeconds / 60)} mins
                          </span>
                          <span className="text-slate-700">|</span>
                          <div className="flex items-center gap-1 text-slate-400">
                            <span>Viewer:</span>
                            <strong className="text-white">
                              {viewerEngine === 'office' ? 'Office Online' : 'Google Docs'}
                            </strong>
                            <button
                              type="button"
                              onClick={() => setViewerEngine(viewerEngine === 'office' ? 'google' : 'office')}
                              className="text-indigo-400 hover:text-indigo-300 underline font-medium ml-1"
                            >
                              (Switch)
                            </button>
                          </div>
                          <span className="text-slate-700">|</span>
                          <a
                            href={
                              viewerEngine === 'office'
                                ? `https://view.officeapps.live.com/op/view.aspx?src=${encodeURIComponent(activeContent.fileUrl)}`
                                : `https://docs.google.com/viewer?url=${encodeURIComponent(activeContent.fileUrl)}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                            Open Externally
                          </a>
                        </div>

                        <div className="flex items-center gap-3">
                          {!(currentProgress?.isCompleted || currentProgress?.is_completed) ? (
                            <button
                              onClick={handleMarkAsCompleted}
                              className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                            >
                              Mark as Reviewed
                            </button>
                          ) : (
                            <span className="text-emerald-400 font-bold bg-emerald-950/60 border border-emerald-800 px-2.5 py-1 rounded-lg">
                              Completed (100%)
                            </span>
                          )}

                          {activeContent.isDownloadable && (
                            <button
                              onClick={() => handleDownload(activeContent.id)}
                              className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded-lg transition"
                            >
                              <Download className="w-3.5 h-3.5" />
                              Download
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* MARKDOWN NOTES VIEWER */}
                  {activeContent.contentType === 'MARKDOWN' && (
                    <div className="w-full h-full flex flex-col bg-white">
                      <div className="flex-1 text-slate-800 p-6 sm:p-10 overflow-y-auto">
                        <div className="max-w-4xl mx-auto">
                          <MarkdownViewer content={activeContent.markdownContent || activeContent.markdown_content || ''} />
                        </div>
                      </div>

                      {/* Markdown Reading Session Bar */}
                      <div className="p-3 bg-slate-100 border-t border-slate-200 flex items-center justify-between text-xs text-slate-700">
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4 text-indigo-600" />
                          <span>Reading Session: {Math.round(readingSessionSeconds / 60)} mins</span>
                        </div>
                        {!(currentProgress?.isCompleted || currentProgress?.is_completed) ? (
                          <button
                            onClick={handleMarkAsCompleted}
                            className="bg-emerald-600 hover:bg-emerald-700 text-white font-semibold px-3 py-1.5 rounded-lg transition"
                          >
                            Mark Notes Complete
                          </button>
                        ) : (
                          <span className="text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded-lg">
                            Completed
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </>
              ) : null}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
