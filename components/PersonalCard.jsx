import React from 'react';

const PatientCard = ({ 
  patientData, 
  variant = "default", // "default", "compact", "wide", "sidebar"
  showPersonalDetails = true,
  showMedicalInfo = true,
  showProfileImage = true,
  profileImageUrl = null,
  enableImageZoom = true,
  className = "",
  maxWidth = null 
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

  // กำหนดสไตล์ตาม variant
  const getContainerClass = () => {
    let baseClass = "bg-gray-100 rounded-lg";
    
    switch (variant) {
      case "sidebar":
        return `${baseClass} w-64 h-auto p-4`; // ขนาดตามภาพ - แคบและยาว
      case "compact":
        return `${baseClass} max-w-sm p-4`;
      case "wide":
        return `${baseClass} w-full p-6`;
      case "full":
        return `${baseClass} w-full h-full p-6`;
      default:
        return `${baseClass} ${maxWidth ? `max-w-${maxWidth}` : 'max-w-md'} mx-auto p-6`;
    }
  };

  const getImageSize = () => {
    switch (variant) {
      case "sidebar":
        return "w-16 h-16";
      case "compact":
        return "w-20 h-20";
      case "wide":
        return "w-24 h-24";
      default:
        return "w-20 h-20";
    }
  };

  const getImageContainerClass = () => {
    return variant === "sidebar" ? "mb-4" : "mb-6";
  };

  const getHeaderClass = () => {
    return variant === "sidebar" ? "flex items-center mb-4" : "flex items-center mb-6";
  };

  const getAvatarSize = () => {
    return variant === "sidebar" ? "w-8 h-8" : "w-12 h-12";
  };

  const getTitleSize = () => {
    return variant === "sidebar" ? "text-lg font-bold" : "text-2xl font-bold";
  };

  const getCardSpacing = () => {
    return variant === "sidebar" ? "space-y-2 mb-3" : "space-y-4 mb-4";
  };

  const getCardPadding = () => {
    return variant === "sidebar" ? "p-3" : "p-4";
  };

  const getIconSize = () => {
    return variant === "sidebar" ? "w-6 h-6" : "w-8 h-8";
  };

  const getTextSize = () => {
    return variant === "sidebar" ? {
      label: "text-sm font-semibold text-gray-700",
      value: "text-sm text-gray-900"
    } : {
      label: "font-bold text-gray-800",
      value: "text-lg"
    };
  };

  const textClasses = getTextSize();

  return (
    <>
    <div className={`${getContainerClass()} ${className}`}>
      {/* Profile Image Section */}
      {showProfileImage && (
        <div className={`text-center ${getImageContainerClass()}`}>
          <div className="inline-block relative">
            {profileImageUrl || patient.profileImage ? (
              <div className="relative group">
                <img 
                  src={profileImageUrl || patient.profileImage || "/api/placeholder/80/80"} 
                  alt={`${patient.First_name} ${patient.Last_name}`}
                  className={`${getImageSize()} rounded-2xl object-cover bg-teal-200 shadow-md transition-transform duration-200 ${enableImageZoom ? 'cursor-pointer hover:scale-105' : ''}`}
                  onClick={handleImageClick}
                />
                {enableImageZoom && (
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-20 rounded-2xl transition-all duration-200 flex items-center justify-center opacity-0 group-hover:opacity-100">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0zM10 7v3m0 0v3m0-3h3m-3 0H7" />
                    </svg>
                  </div>
                )}
              </div>
            ) : (
              <div className={`${getImageSize()} rounded-2xl bg-teal-200 flex items-center justify-center shadow-md`}>
                <svg className={variant === "sidebar" ? "w-8 h-8" : "w-12 h-12"} viewBox="0 0 24 24" fill="white">
                  <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
                </svg>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Header - ชื่อผู้ป่วย */}
      <div className={showProfileImage ? "text-center mb-6" : getHeaderClass()}>
        {!showProfileImage && (
          <div className="bg-white rounded-full p-2 mr-3 flex-shrink-0">
            <svg className={getAvatarSize()} viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
            </svg>
          </div>
        )}
        <div className={showProfileImage ? "" : "flex-1"}>
          <h2 className={getTitleSize()}>{patient.First_name} {patient.Last_name}</h2>
          {showProfileImage && (
            <p className="text-gray-500 text-sm mt-1">Age {patient.Age}</p>
          )}
        </div>
      </div>

      {/* ข้อมูลพื้นฐาน */}
      <div className={getCardSpacing()}>
        <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg className={getIconSize()} viewBox="0 0 24 24" fill="black">
                <path d="M20 4H4c-1.11 0-1.99.89-1.99 2L2 18c0 1.11.89 2 2 2h16c1.11 0 2-.89 2-2V6c0-1.11-.89-2-2-2zm0 14H4v-6h16v6zm0-10H4V6h16v2z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={textClasses.label}>Hospital Number</p>
              <p className={textClasses.value}>{patient.HN}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg className={getIconSize()} viewBox="0 0 24 24" fill="black">
                <path d="M7 13c1.66 0 3-1.34 3-3S8.66 7 7 7s-3 1.34-3 3 1.34 3 3 3zm12-6h-8v7H3V5H1v15h2v-3h18v3h2v-9c0-2.21-1.79-4-4-4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={textClasses.label}>ROOM</p>
              <p className={textClasses.value}>{patient.Room}</p>
            </div>
          </div>
        </div>

        <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
          <div className="flex items-center">
            <div className="mr-3 flex-shrink-0">
              <svg className={getIconSize()} viewBox="0 0 24 24" fill="black">
                <path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z" />
              </svg>
            </div>
            <div className="min-w-0 flex-1">
              <p className={textClasses.label}>Doctor</p>
              <p className={textClasses.value}>{patient.Doctor_name}</p>
            </div>
          </div>
        </div>
      </div>

      {/* ข้อมูลทางการแพทย์ */}
      {showMedicalInfo && (
        <div className={getCardSpacing()}>
          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <div className="flex items-start">
              <div className="mr-3 mt-1 flex-shrink-0">
                <svg className={getIconSize()} viewBox="0 0 24 24" fill="black">
                  <path d="M19 3H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2V5c0-1.1-.9-2-2-2zm-5 14H7v-2h7v2zm3-4H7v-2h10v2zm0-4H7V7h10v2z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className={textClasses.label}>Diagnosis</p>
                <p className={`${textClasses.value} break-words`}>{patient.Diagnosis}</p>
              </div>
            </div>
          </div>

          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <div className="flex items-start">
              <div className="mr-3 mt-1 flex-shrink-0">
                <svg className={getIconSize()} viewBox="0 0 24 24" fill="black">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-1 17.93c-3.95-.49-7-3.85-7-7.93 0-.62.08-1.21.21-1.79L9 15v1c0 1.1.9 2 2 2v1.93zm6.9-2.54c-.26-.81-1-1.39-1.9-1.39h-1v-3c0-.55-.45-1-1-1H8v-2h2c.55 0 1-.45 1-1V7h2c1.1 0 2-.9 2-2v-.41c2.93 1.19 5 4.06 5 7.41 0 2.08-.8 3.97-2.1 5.39z" />
                </svg>
              </div>
              <div className="min-w-0 flex-1">
                <p className={textClasses.label}>Status</p>
                <p className={`${textClasses.value} break-words`}>{patient.Status}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ข้อมูลส่วนตัว */}
      {showPersonalDetails && (
        <div className={variant === "sidebar" ? "grid grid-cols-2 gap-2" : "grid grid-cols-2 gap-4"}>
          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <p className={textClasses.label}>Gender</p>
            <p className={textClasses.value}>{patient.Sex}</p>
          </div>

          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <p className={textClasses.label}>Age</p>
            <p className={textClasses.value}>{patient.Age}</p>
          </div>

          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <p className={textClasses.label}>Height</p>
            <p className={textClasses.value}>{patient.Height} cm</p>
          </div>

          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <p className={textClasses.label}>Weight</p>
            <p className={textClasses.value}>{patient.Weight} kg</p>
          </div>

          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <p className={textClasses.label}>BMI</p>
            <p className={textClasses.value}>{patient.BMI}</p>
          </div>

          <div className={`bg-white ${getCardPadding()} rounded-lg shadow-sm`}>
            <p className={textClasses.label}>Device</p>
            <p className={`${textClasses.value} break-all`}>{patient.DeviceID}</p>
          </div>
        </div>
      )}
    </div>

    {/* Image Modal */}
    {isImageModalOpen && (profileImageUrl || patient.profileImage) && (
      <div 
        className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50"
        onClick={closeImageModal}
      >
        <div className="relative max-w-4xl max-h-screen p-4">
          <button
            onClick={closeImageModal}
            className="absolute top-4 right-4 text-white hover:text-gray-300 z-10"
          >
            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
          <img
            src={profileImageUrl || patient.profileImage}
            alt={`${patient.First_name} ${patient.Last_name} - Full Size`}
            className="max-w-full max-h-full object-contain rounded-lg shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          />
          <div className="absolute bottom-4 left-4 bg-black bg-opacity-50 text-white px-4 py-2 rounded-lg">
            <p className="font-semibold">{patient.First_name} {patient.Last_name}</p>
            <p className="text-sm opacity-75">Patient ID: {patient.HN}</p>
          </div>
        </div>
      </div>
    )}
  </>
  );
};

export default PatientCard;

// ตัวอย่างการใช้งานตามภาพ:

/*
// สำหรับ sidebar ด้านซ้าย (ตามภาพ) พร้อมฟีเจอร์ขยายรูป
<PatientCard 
  patientData={patientData} 
  variant="sidebar"
  showProfileImage={true}
  profileImageUrl="/path/to/image.jpg"
  enableImageZoom={true}
/>

// ปิดฟีเจอร์ขยายรูป
<PatientCard 
  patientData={patientData} 
  variant="wide"
  showProfileImage={true}
  enableImageZoom={false}
/>

// แบบปกติ
<PatientCard 
  patientData={patientData} 
  variant="default"
  showProfileImage={false}  // ไม่แสดงรูป
/>

// ใช้รูปจาก patient data พร้อมขยายได้
<PatientCard 
  patientData={{
    ...patientData,
    profileImage: "/images/patient1.jpg"
  }}
  variant="default"
  showProfileImage={true}
  enableImageZoom={true}
/>
*/