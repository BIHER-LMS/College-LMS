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
} from 'lucide-react';
import { studentApi } from '../api/studentApi';

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

  // Video Telemetry Tracking State
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [lastTrackedTime, setLastTrackedTime] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentProgress, setCurrentProgress] = useState<any>(null);
  const heartbeatTimerRef = useRef<any>(null);

  useEffect(() => {
    loadLearningMaterials();
  }, []);

  const loadLearningMaterials = async () => {
    try {
      setLoading(true);
      const data = await studentApi.getLearningContents();
      setSubjects(data || []);
      if (data && data.length > 0) {
        setSelectedSubjectId(data[0].classSubjectId);
      }
    } catch (err) {
      console.error('Failed to load student learning materials:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenContent = async (contentId: string) => {
    try {
      setActiveContentLoading(true);
      setIsPreviewModalOpen(true);
      const content = await studentApi.getContentDetails(contentId);
      setActiveContent(content);
      setCurrentProgress(content.progress);
      setLastTrackedTime(content.progress?.lastPositionSeconds || 0);
    } catch (err) {
      console.error('Failed to load content details:', err);
      alert('Failed to load learning material.');
      setIsPreviewModalOpen(false);
    } finally {
      setActiveContentLoading(false);
    }
  };

  const handleCloseContent = () => {
    if (heartbeatTimerRef.current) {
      clearInterval(heartbeatTimerRef.current);
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
      if (res?.data) {
        setCurrentProgress(res.data);
      }
    } catch (err) {
      console.warn('Telemetry event failed:', err);
    }
  };

  // HTML5 Video Playback Listeners
  const onVideoPlay = () => {
    if (!videoRef.current) return;
    logVideoEvent('PLAY', videoRef.current.currentTime, videoRef.current.duration);

    // Setup 5-second interval heartbeat
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
  };

  // Resume Video on Loaded
  const onVideoLoadedMetadata = () => {
    if (videoRef.current && activeContent?.progress?.lastPositionSeconds > 0) {
      videoRef.current.currentTime = activeContent.progress.lastPositionSeconds;
    }
  };

  // Speed Change
  const handleChangeSpeed = (speed: number) => {
    setPlaybackSpeed(speed);
    if (videoRef.current) {
      videoRef.current.playbackRate = speed;
    }
  };

  // Download Handler
  const handleDownload = async (contentId: string) => {
    try {
      const res = await studentApi.getAuthorizedDownload(contentId);
      const downloadData = (res as any)?.data || res;
      if (downloadData.fileUrl) {
        const link = document.createElement('a');
        link.href = downloadData.fileUrl;
        link.download = downloadData.fileName || 'learning-material';
        link.target = '_blank';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
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
                {s.subject.name} ({s.overallCompletionRate}%)
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Selected Subject Progress Header */}
      {selectedSubject && (
        <div className="bg-gradient-to-r from-indigo-900 to-slate-900 text-white p-6 rounded-2xl shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <span className="text-xs font-semibold uppercase tracking-wider text-indigo-300">
              {selectedSubject.subject.code} • {selectedSubject.subject.credits} Credits
            </span>
            <h2 className="text-xl font-bold mt-0.5">{selectedSubject.subject.name}</h2>
            <p className="text-xs text-slate-300 mt-1">
              Faculty: {selectedSubject.faculty?.display_name || 'Department Faculty'}
            </p>
          </div>

          <div className="flex items-center gap-4 bg-white/10 p-3 rounded-xl backdrop-blur-sm">
            <div>
              <span className="text-[11px] text-slate-300 uppercase block">Course Completion</span>
              <span className="text-xl font-extrabold">{selectedSubject.overallCompletionRate}%</span>
            </div>
            <div className="w-24 bg-white/20 rounded-full h-2.5">
              <div
                className="bg-emerald-400 h-2.5 rounded-full transition-all"
                style={{ width: `${selectedSubject.overallCompletionRate}%` }}
              />
            </div>
          </div>
        </div>
      )}

      {/* Topics & Content Grid */}
      {selectedSubject?.topics?.length === 0 ? (
        <div className="text-center py-16 bg-white rounded-2xl border border-slate-200 p-8">
          <BookOpen className="w-12 h-12 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-semibold text-slate-700">No Learning Content Available</h3>
          <p className="text-xs text-slate-400 mt-1">
            Your professor has not published any lecture materials or topics for this course yet.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {selectedSubject?.topics?.map((topic: any, tIdx: number) => (
            <div
              key={topic.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden"
            >
              <div className="p-5 bg-slate-50/70 border-b border-slate-100 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="w-7 h-7 rounded-lg bg-indigo-100 text-indigo-700 font-bold text-xs flex items-center justify-center">
                    {tIdx + 1}
                  </span>
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{topic.title}</h3>
                    {topic.description && (
                      <p className="text-xs text-slate-500 mt-0.5">{topic.description}</p>
                    )}
                  </div>
                </div>

                <span className="text-xs font-semibold text-slate-500 bg-white border border-slate-200 px-3 py-1 rounded-full">
                  {topic.contents.length} {topic.contents.length === 1 ? 'Resource' : 'Resources'}
                </span>
              </div>

              {/* Contents in topic */}
              <div className="p-4 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {topic.contents.map((item: any) => {
                  const isCompleted = item.progress?.isCompleted;
                  const progressPct = item.progress?.completionPercentage || 0;

                  return (
                    <div
                      key={item.id}
                      className="border border-slate-200/80 rounded-2xl p-4 flex flex-col justify-between hover:shadow-md hover:border-indigo-300 transition bg-white group cursor-pointer"
                      onClick={() => handleOpenContent(item.id)}
                    >
                      <div>
                        <div className="flex items-center justify-between mb-3">
                          <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-100 group-hover:bg-indigo-50 transition">
                            {getContentIcon(item.content_type)}
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
                          {item.content_type}
                        </span>

                        <div className="flex items-center gap-2">
                          {item.isDownloadable && (
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
      {/* IN-APP PREVIEW & VIDEO PLAYER MODAL */}
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
                    {activeContent?.topic?.title} • {activeContent?.classSubject?.subjectName}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                {activeContent?.isDownloadable && activeContent?.fileUrl && (
                  <button
                    onClick={() => handleDownload(activeContent.id)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-1.5 rounded-lg transition"
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
                  {/* VIDEO PLAYER (Direct Upload MP4 / WebM) */}
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
                            <span>Watch: {Math.round(currentProgress.watch_time_seconds / 60)}m</span>
                            <span>•</span>
                            <span className="text-emerald-400 font-bold">
                              {currentProgress.completion_percentage}% Done
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* YOUTUBE EMBED PLAYER */}
                  {activeContent.contentType === 'YOUTUBE' && activeContent.youtubeVideoId && (
                    <div className="w-full h-full p-4 flex flex-col items-center justify-center">
                      <div className="w-full max-w-4xl aspect-video rounded-xl overflow-hidden shadow-2xl bg-black">
                        <iframe
                          src={`https://www.youtube.com/embed/${activeContent.youtubeVideoId}?autoplay=1&enablejsapi=1`}
                          title={activeContent.title}
                          className="w-full h-full border-0"
                          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                          allowFullScreen
                        />
                      </div>
                      <div className="mt-3 text-xs text-slate-400 flex items-center gap-2">
                        <span>Streaming via YouTube Embedded API</span>
                      </div>
                    </div>
                  )}

                  {/* PDF PREVIEWER */}
                  {activeContent.contentType === 'PDF' && activeContent.fileUrl && (
                    <div className="w-full h-full bg-slate-800 flex items-center justify-center">
                      <iframe
                        src={`${activeContent.fileUrl}#toolbar=1`}
                        title={activeContent.title}
                        className="w-full h-full border-0"
                      />
                    </div>
                  )}

                  {/* OFFICE DOCUMENTS (PPT, PPTX, DOC, DOCX) */}
                  {(activeContent.contentType === 'PPT' || activeContent.contentType === 'DOC') && (
                    <div className="w-full h-full bg-slate-900 flex flex-col items-center justify-center p-6 text-center text-white">
                      <div className="p-4 bg-white/10 rounded-2xl mb-4">
                        <FileText className="w-12 h-12 text-amber-400" />
                      </div>
                      <h3 className="text-lg font-bold mb-1">{activeContent.title}</h3>
                      <p className="text-xs text-slate-400 max-w-md mb-6">
                        Microsoft Office Document ({activeContent.contentType}). You can preview it using Google Viewer or download the original file.
                      </p>

                      <div className="flex items-center gap-3">
                        <a
                          href={`https://docs.google.com/viewer?url=${encodeURIComponent(
                            activeContent.fileUrl
                          )}&embedded=true`}
                          target="_blank"
                          rel="noreferrer"
                          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition shadow"
                        >
                          <ExternalLink className="w-4 h-4" />
                          <span>Open in Document Viewer</span>
                        </a>

                        {activeContent.isDownloadable && (
                          <button
                            onClick={() => handleDownload(activeContent.id)}
                            className="flex items-center gap-2 bg-white/10 hover:bg-white/20 text-white font-medium text-xs px-4 py-2.5 rounded-xl transition"
                          >
                            <Download className="w-4 h-4" />
                            <span>Download File</span>
                          </button>
                        )}
                      </div>
                    </div>
                  )}

                  {/* MARKDOWN NOTES VIEWER */}
                  {activeContent.contentType === 'MARKDOWN' && (
                    <div className="w-full h-full bg-white text-slate-800 p-8 overflow-y-auto">
                      <div className="max-w-3xl mx-auto">
                        <h1 className="text-2xl font-bold text-slate-900 pb-3 border-b border-slate-200 mb-6">
                          {activeContent.title}
                        </h1>
                        <div className="prose prose-slate max-w-none whitespace-pre-wrap font-sans text-sm leading-relaxed">
                          {activeContent.markdownContent || 'No content provided.'}
                        </div>
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
