// PatientCard.jsx
import React from 'react';

const PatientCard = ({ 
  patientData,
  showPersonalDetails = true,
  showMedicalInfo = true,
  showProfileImage = true,
  profileImageUrl = null,
  enableImageZoom = true,
  className = ""
}) => {
  const patient = patientData || {};
  const [isImageModalOpen, setIsImageModalOpen] = React.useState(false);

  const handleImageClick = () => {
    if (enableImageZoom) {
      setIsImageModalOpen(true);
    }
  };

  const closeImageModal = () => {
    setIsImageModalOpen(false);
  };

  return (
    <>
      <div className={`bg-base-100 w-full h-full ${className}`}>
        <div className="p-6">
          {/* Back Button */}
          <div className="flex items-center gap-2 text-base-content/60 mb-6 cursor-pointer hover:text-base-content">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            <span className="text-sm">Back to dashboard</span>
          </div>

          {/* Title */}
          <h1 className="text-2xl font-bold text-base-content mb-8">Current Appointment</h1>

          {/* Profile Section */}
          {showProfileImage && (
            <div className="text-center mb-8">
              <div className="avatar mb-4">
                <div className="w-20 h-20 rounded-full bg-primary text-primary-content relative group">
                  {profileImageUrl || patient.profileImage ? (
                    <>
                      <img 
                        src={profileImageUrl || patient.profileImage || "/api/placeholder/80/80"} 
                        alt={`${patient.First_name} ${patient.Last_name}`}
                        className={`rounded-full object-cover transition-transform duration-200 ${
                          enableImageZoom ? 'cursor-pointer hover:scale-105' : ''
                        }`}
                        onClick={handleImageClick}
                      />
                      {enableImageZoom && (
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 rounded-full transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                          <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                          </svg>
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full rounded-full bg-primary text-primary-content flex items-center justify-center text-2xl font-bold">
                      {patient.First_name?.charAt(0) || '--'}
                    </div>
                  )}
                </div>
              </div>
              
              <h2 className="text-xl font-bold text-base-content mb-1">
                {patient.First_name || '--'} {patient.Last_name || '--'}
              </h2>
              <p className="text-base-content/60 text-sm mb-4">Age: {patient.Age || '--'}</p>
              
              <button className="btn btn-primary btn-sm rounded-full px-6">
                Update
              </button>
            </div>
          )}

          {/* Device Information */}
          <div className="mb-8">
            <h3 className="font-bold text-base-content mb-4">Device Information:</h3>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Device ID:</span>
                <span className="font-medium text-base-content">{patient.DeviceID || 'MD-V5-000804'}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Status:</span>
                <span className="font-medium text-base-content">Active</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-base-content/70">Battery:</span>
                <span className="font-medium text-base-content">85%</span>
              </div>
            </div>
          </div>

          {/* Information Section */}
          {showMedicalInfo && (
            <div className="mb-8">
              <h3 className="font-bold text-base-content mb-4">Information:</h3>
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Gender:</span>
                  <div className="flex items-center gap-2">
                    <span className="text-lg">
                      {patient.Sex === 'Male' ? '♂️' : patient.Sex === 'Female' ? '♀️' : '♂️'}
                    </span>
                    <span className="font-medium text-base-content">{patient.Sex || 'Male'}</span>
                  </div>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Blood Type:</span>
                  <span className="font-medium text-base-content">O+ (Positive)</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Allergies:</span>
                  <span className="font-medium text-base-content">Milk, Penicillin</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Diseases:</span>
                  <span className="font-medium text-base-content">Diabetes, Blood Disorders</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Patient ID:</span>
                  <span className="font-medium text-base-content">{patient.HN || '204896786'}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-base-content/70">Last Visit:</span>
                  <span className="font-medium text-base-content">25th October 2019</span>
                </div>
              </div>
            </div>
          )}

          {/* Physical Information */}
          {showPersonalDetails && (
            <div className="mb-8">
              <h3 className="font-bold text-base-content mb-4">Physical Information:</h3>
              
              {/* Height & Weight */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="text-center">
                  <div className="bg-base-200 rounded-lg p-4">
                    <div className="text-base-content/60 text-sm mb-1">Height</div>
                    <div className="text-xl font-bold text-base-content">
                      {patient.Height || '178'}cm
                    </div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-base-200 rounded-lg p-4">
                    <div className="text-base-content/60 text-sm mb-1">Weight</div>
                    <div className="text-xl font-bold text-base-content">
                      {patient.Weight || '65'} kg
                    </div>
                  </div>
                </div>
              </div>

              {/* BMI Section */}
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center">
                  <div className="bg-base-200 rounded-lg p-4">
                    <div className="text-3xl font-bold text-orange-500 mb-2">
                      {patient.BMI || '20.5'}
                    </div>
                    <div className="text-base-content/60 text-sm">BMI Value</div>
                  </div>
                </div>
                <div className="text-center">
                  <div className="bg-base-200 rounded-lg p-4">
                    <div className="relative w-16 h-16 mx-auto mb-2">
                      <div className="w-16 h-16 rounded-full border-4 border-base-300 relative overflow-hidden">
                        <div 
                          className="absolute inset-0 rounded-full border-4 border-orange-500"
                          style={{
                            transform: `rotate(${Math.min(((patient.BMI || 20.5) / 40) * 360, 360)}deg)`,
                            clipPath: 'polygon(50% 50%, 50% 0%, 100% 0%, 100% 50%)'
                          }}
                        ></div>
                        <div className="absolute inset-1 bg-base-100 rounded-full flex items-center justify-center">
                          <span className="text-xs font-bold text-orange-500">{patient.BMI || '20.5'}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-base-content/60 text-sm">BMI Gauge</div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {isImageModalOpen && (profileImageUrl || patient.profileImage) && (
        <div className="modal modal-open">
          <div className="modal-box max-w-4xl">
            <button
              onClick={closeImageModal}
              className="btn btn-sm btn-circle btn-ghost absolute right-2 top-2"
            >
              ✕
            </button>
            <figure className="px-4 pt-4">
              <img
                src={profileImageUrl || patient.profileImage}
                alt={`${patient.First_name} ${patient.Last_name} - Full Size`}
                className="rounded-xl max-w-full max-h-[70vh] object-contain mx-auto"
              />
            </figure>
            <div className="card-body text-center">
              <h2 className="card-title justify-center">
                {patient.First_name} {patient.Last_name}
              </h2>
              <p className="text-sm opacity-70">Patient ID: {patient.HN}</p>
            </div>
          </div>
          <div className="modal-backdrop" onClick={closeImageModal}></div>
        </div>
      )}
    </>
  );
};

export default PatientCard;