import { useState, useEffect } from 'react';
import { getCollegeProfile, updateCollegeProfile } from '../../services/api/collegeProfile';

export function CollegeProfile() {
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    setLoading(true);
    setError(null);
    try {
      const data = await getCollegeProfile();
      setProfile(data);
      setFormData(data);
    } catch (err: any) {
      setError(err.message || 'Failed to load profile.');
    } finally {
      setLoading(false);
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveError(null);
    setSaveSuccess(false);
    try {
      
      // Extract only allowed fields to satisfy strict backend schema
      const updatableFields: Record<string, any> = {
        name: formData.name,
        type: formData.type,
        domain: formData.domain,
        address: formData.address,
        addressLine2: formData.addressLine2,
        city: formData.city,
        district: formData.district,
        state: formData.state,
        country: formData.country,
        pincode: formData.pincode,
        phone: formData.phone,
        email: formData.email,
        website: formData.website,
        logoUrl: formData.logoUrl,
        establishedYear: formData.establishedYear ? parseInt(formData.establishedYear, 10) : null,
        affiliatedUniversity: formData.affiliatedUniversity,
        accreditation: formData.accreditation,
        naacGrade: formData.naacGrade,
        recognition: formData.recognition,
        institutionType: formData.institutionType,
        principalName: formData.principalName,
        principalEmail: formData.principalEmail,
        principalPhone: formData.principalPhone,
        adminOfficeEmail: formData.adminOfficeEmail,
        adminOfficePhone: formData.adminOfficePhone,
        linkedinUrl: formData.linkedinUrl,
        instagramUrl: formData.instagramUrl,
        facebookUrl: formData.facebookUrl,
        youtubeUrl: formData.youtubeUrl
      };
      
      // Clean up undefined values and empty strings for optional nullables
      Object.keys(updatableFields).forEach(key => {
        if (updatableFields[key] === undefined) {
          delete updatableFields[key];
        }
      });

      
      const updatedProfile = await updateCollegeProfile(updatableFields);
      setProfile(updatedProfile);
      setFormData(updatedProfile);
      setIsEditing(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || 'Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center p-12">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mb-4"></div>
        <p className="text-slate-500">Loading college profile...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 text-red-600 p-6 rounded-lg border border-red-200 text-center">
        <p className="font-medium mb-4">{error}</p>
        <button 
          onClick={loadProfile}
          className="px-4 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded transition-colors"
        >
          Retry
        </button>
      </div>
    );
  }

  if (!profile) {
    return (
      <div className="bg-amber-50 text-amber-700 p-6 rounded-lg border border-amber-200 text-center">
        <p className="font-medium">No college has been assigned to your account.</p>
        <p className="text-sm mt-2">Contact the platform administrator.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-center bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">College Profile</h1>
          <p className="text-slate-500 text-sm mt-1">Manage your college's institutional information and contact details.</p>
        </div>
        {!isEditing && (
          <button 
            onClick={() => {
              setFormData(profile);
              setIsEditing(true);
            }}
            className="px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Edit Profile
          </button>
        )}
      </div>

      {saveSuccess && (
        <div className="bg-green-50 text-green-700 p-4 rounded-lg border border-green-200">
          Profile updated successfully.
        </div>
      )}

      {saveError && (
        <div className="bg-red-50 text-red-600 p-4 rounded-lg border border-red-200">
          {saveError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        
        {/* Header Section */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex items-start gap-6">
          <div className="w-24 h-24 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center overflow-hidden shrink-0">
            {profile.logoUrl ? (
              <img src={profile.logoUrl} alt="Logo" className="w-full h-full object-contain" />
            ) : (
              <span className="text-3xl font-bold text-slate-300">{profile.name?.charAt(0)}</span>
            )}
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-slate-800">{profile.name}</h2>
            <div className="flex items-center gap-3 mt-2 text-sm">
              <span className="bg-slate-100 text-slate-700 px-2 py-1 rounded font-medium uppercase border border-slate-200">
                {profile.code}
              </span>
              <span className={`px-2 py-1 rounded font-medium border ${profile.isActive ? 'bg-green-50 text-green-700 border-green-200' : 'bg-red-50 text-red-700 border-red-200'}`}>
                {profile.isActive ? 'Active' : 'Inactive'}
              </span>
            </div>
            {isEditing && (
              <div className="mt-4">
                <label className="block text-sm font-medium text-slate-700 mb-1">Logo URL</label>
                <input 
                  type="url" 
                  name="logoUrl" 
                  value={formData.logoUrl || ''} 
                  onChange={handleChange}
                  className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 focus:border-blue-600 outline-none text-sm"
                  placeholder="https://example.com/logo.png"
                />
              </div>
            )}
          </div>
        </div>

        {/* Basic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Basic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College Name</label>
              {isEditing ? (
                <input required type="text" name="name" value={formData.name || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.name}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College Code</label>
              <p className="text-slate-500">{profile.code} <span className="text-xs ml-1">(Immutable)</span></p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">College Type</label>
              {isEditing ? (
                <select name="type" value={formData.type || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm">
                  <option value="">Select Type</option>
                  <option value="Government">Government</option>
                  <option value="Private">Private</option>
                  <option value="Aided">Aided</option>
                  <option value="Autonomous">Autonomous</option>
                </select>
              ) : (
                <p className="text-slate-800">{profile.type || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Established Year</label>
              {isEditing ? (
                <input type="number" name="establishedYear" value={formData.establishedYear || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.establishedYear || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Contact Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Official Email</label>
              {isEditing ? (
                <input type="email" name="email" value={formData.email || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.email || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              {isEditing ? (
                <input type="text" name="phone" value={formData.phone || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.phone || 'Not provided'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Website</label>
              {isEditing ? (
                <input type="url" name="website" value={formData.website || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-blue-700 hover:underline">
                  {profile.website ? (
                    <a href={profile.website} target="_blank" rel="noopener noreferrer">{profile.website}</a>
                  ) : 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Address */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Address</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address</label>
              {isEditing ? (
                <input type="text" name="address" value={formData.address || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.address || 'Not provided'}</p>
              )}
            </div>
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-slate-700 mb-1">Address Line 2</label>
              {isEditing ? (
                <input type="text" name="addressLine2" value={formData.addressLine2 || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.addressLine2 || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
              {isEditing ? (
                <input type="text" name="city" value={formData.city || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.city || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">District</label>
              {isEditing ? (
                <input type="text" name="district" value={formData.district || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.district || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
              {isEditing ? (
                <input type="text" name="state" value={formData.state || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.state || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Country</label>
              {isEditing ? (
                <input type="text" name="country" value={formData.country || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.country || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
              {isEditing ? (
                <input type="text" name="pincode" value={formData.pincode || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.pincode || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Academic Information */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Academic Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Affiliated University</label>
              {isEditing ? (
                <input type="text" name="affiliatedUniversity" value={formData.affiliatedUniversity || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.affiliatedUniversity || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Accreditation</label>
              {isEditing ? (
                <input type="text" name="accreditation" value={formData.accreditation || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.accreditation || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">NAAC Grade</label>
              {isEditing ? (
                <select name="naacGrade" value={formData.naacGrade || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm">
                  <option value="">Select Grade</option>
                  <option value="A++">A++</option>
                  <option value="A+">A+</option>
                  <option value="A">A</option>
                  <option value="B++">B++</option>
                  <option value="B+">B+</option>
                  <option value="B">B</option>
                  <option value="C">C</option>
                </select>
              ) : (
                <p className="text-slate-800">{profile.naacGrade || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Recognition</label>
              {isEditing ? (
                <input type="text" name="recognition" value={formData.recognition || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="e.g. AICTE, UGC" />
              ) : (
                <p className="text-slate-800">{profile.recognition || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Institution Type</label>
              {isEditing ? (
                <input type="text" name="institutionType" value={formData.institutionType || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" placeholder="e.g. Engineering, Arts & Science" />
              ) : (
                <p className="text-slate-800">{profile.institutionType || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Administration */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Administration</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Principal Name</label>
              {isEditing ? (
                <input type="text" name="principalName" value={formData.principalName || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.principalName || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Principal Email</label>
              {isEditing ? (
                <input type="email" name="principalEmail" value={formData.principalEmail || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.principalEmail || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Principal Phone</label>
              {isEditing ? (
                <input type="text" name="principalPhone" value={formData.principalPhone || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.principalPhone || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Office Email</label>
              {isEditing ? (
                <input type="email" name="adminOfficeEmail" value={formData.adminOfficeEmail || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.adminOfficeEmail || 'Not provided'}</p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Admin Office Phone</label>
              {isEditing ? (
                <input type="text" name="adminOfficePhone" value={formData.adminOfficePhone || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-slate-800">{profile.adminOfficePhone || 'Not provided'}</p>
              )}
            </div>
          </div>
        </div>

        {/* Online Presence */}
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 border-b border-slate-100 pb-3 mb-4">Online Presence</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">LinkedIn URL</label>
              {isEditing ? (
                <input type="url" name="linkedinUrl" value={formData.linkedinUrl || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-blue-700 hover:underline">
                  {profile.linkedinUrl ? <a href={profile.linkedinUrl} target="_blank" rel="noopener noreferrer">View Profile</a> : 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Instagram URL</label>
              {isEditing ? (
                <input type="url" name="instagramUrl" value={formData.instagramUrl || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-blue-700 hover:underline">
                  {profile.instagramUrl ? <a href={profile.instagramUrl} target="_blank" rel="noopener noreferrer">View Profile</a> : 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Facebook URL</label>
              {isEditing ? (
                <input type="url" name="facebookUrl" value={formData.facebookUrl || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-blue-700 hover:underline">
                  {profile.facebookUrl ? <a href={profile.facebookUrl} target="_blank" rel="noopener noreferrer">View Profile</a> : 'Not provided'}
                </p>
              )}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">YouTube URL</label>
              {isEditing ? (
                <input type="url" name="youtubeUrl" value={formData.youtubeUrl || ''} onChange={handleChange} className="w-full p-2 border border-slate-300 rounded focus:ring-2 focus:ring-blue-600 outline-none text-sm" />
              ) : (
                <p className="text-blue-700 hover:underline">
                  {profile.youtubeUrl ? <a href={profile.youtubeUrl} target="_blank" rel="noopener noreferrer">View Profile</a> : 'Not provided'}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        {isEditing && (
          <div className="flex justify-end gap-3 sticky bottom-6 bg-slate-50 p-4 rounded-xl border border-slate-200 shadow-md">
            <button 
              type="button" 
              onClick={() => {
                setFormData(profile);
                setIsEditing(false);
                setSaveError(null);
              }}
              className="px-4 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg transition-colors font-medium"
              disabled={saving}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-medium flex items-center gap-2"
              disabled={saving}
            >
              {saving && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>}
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        )}
      </form>
    </div>
  );
}
