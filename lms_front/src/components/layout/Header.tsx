import { Bell, LogOut, Menu, Play } from "lucide-react";
import { useSettings } from "../../contexts/SettingsContext";
import { useSessions } from "../../contexts/SessionsContext";
import React, { useState, useMemo, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { useProfile } from "../../features/student/hooks/useProfile";

interface HeaderProps {
  onMenuClick?: () => void;
  userRole: "admin" | "teacher" | "student";
  isCollapsed?: boolean;
}

// صغير reusable component
const TimeBox = ({ value, label }: { value: string; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-sm md:text-xl font-black leading-none text-slate-800">
      {value}
    </span>
    <span className="text-[7px] md:text-[9px] text-slate-400 uppercase font-bold tracking-tighter">
      {label}
    </span>
  </div>
);

export default function Header({
  onMenuClick,
  userRole,
  isCollapsed,
}: HeaderProps) {
  const { settings } = useSettings();
  const { countdown, isSessionReady } = useSessions();
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const { data: profileResponse, isLoading, isError } = useProfile();

  const profileData = profileResponse?.data;

  // تحسين الأداء بدل function عادية
  const marginClass = useMemo(() => {
    if (userRole === "student") return "";
    return isCollapsed ? "lg:ml-20" : "lg:ml-72";
  }, [userRole, isCollapsed]);

  const isStudent = userRole === "student";
  const isTeacherOrStudent = userRole === "teacher" || isStudent;
  const navigate = useNavigate();

  const studentInfo = {
    name: profileData?.user?.name || "---",
    plan: profileData?.plan?.name_en || "Free Plan",
    avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profileData?.user?.name || "U")}&background=random`,
  };

  const handleLogout = useCallback(() => {
    localStorage.removeItem("token");
    sessionStorage.removeItem("token");
    navigate("/");
  }, [navigate]);

  return (
    <header
      className={`bg-white sticky top-0 z-40 transition-all duration-300 border-b border-gray-100 ${marginClass}`}
    >
      <div
        className={`flex flex-col md:flex-row items-center justify-between px-4 sm:px-8 py-3 md:py-0 md:h-[90px] gap-3 md:gap-0 ${isStudent ? "grid grid-cols-4" : ""}`}
      >
        {/* 1. حاوية اللوجو */}
        <div
          className={`flex items-center relative hover: cursor-pointer ${isStudent ? "col-span-1" : ""}`}
          onClick={() => navigate("/")}
        >
          {isStudent && (
            <div className="flex flex-row items-center gap-2">
              <div className="flex flex-col items-center justify-center p-2 bg-[#2049BF] rounded-[12px] w-[39px] h-[39px]">
                <span className="text-white text-xl font-bold">J</span>
              </div>
              <span className="text-black text-xl font-bold">Jupiter</span>
            </div>
          )}

          {!isStudent && onMenuClick && (
            <button
              onClick={onMenuClick}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors lg:hidden"
            >
              <Menu className="w-6 h-6 text-gray-600" />
            </button>
          )}
        </div>

        {/* 2. حاوية الوقت وزر الانضمام */}
        <div
          className={`flex items-center justify-center gap-4 md:gap-12 ${isStudent ? "col-span-2" : "flex-1"}`}
        >
          {isTeacherOrStudent && (
            <div className="flex items-center gap-4 md:gap-12 min-w-0">
              <div className="flex items-center gap-2 md:gap-4 bg-slate-50/80 px-4 md:px-6 py-2 md:py-3 rounded-[20px] border border-slate-100">
                <span className="hidden sm:inline-block text-[9px] md:text-[11px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap mr-2">
                  Next Session:
                </span>
                <div className="flex gap-4 md:gap-8 items-center">
                  <TimeBox value={countdown.days} label="Days" />
                  <Separator />
                  <TimeBox value={countdown.hours} label="Hours" />
                  <Separator />
                  <TimeBox value={countdown.minutes} label="Min" />
                </div>
              </div>

              <button
                disabled={!isSessionReady}
                className={`hidden md:flex items-center gap-2 px-4 md:px-8 py-2 md:py-3.5 rounded-2xl text-[10px] md:text-sm font-bold whitespace-nowrap transition-all ${
                  isSessionReady
                    ? "bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-200"
                    : "bg-[#f1f5f9] text-slate-400 cursor-not-allowed"
                }`}
              >
                <Play size={16} fill="currentColor" />
                {isSessionReady ? "Join Now" : "Join Session"}
              </button>
            </div>
          )}
        </div>

        {/* 3. حاوية البروفايل */}
        <div
          className={`flex items-center gap-2 md:gap-8 ${isStudent ? "col-span-1 justify-end" : ""}`}
        >
          {isTeacherOrStudent && (
            <>
              <button className="md:hidden flex items-center gap-2 bg-[#f1f5f9] text-slate-400 px-4 py-2 rounded-xl text-[10px] font-bold cursor-not-allowed">
                <Play size={14} fill="currentColor" />
                Join
              </button>
              <DesktopProfile navigate={navigate} studentName={studentInfo.name} studentPlan={studentInfo.plan} studentAvatar={studentInfo.avatar} />
              <button
                onClick={handleLogout}
                className="p-2 text-red-500 rounded-2xl hover:bg-red-50 transition-colors"
              >
                <LogOut size={20} />
              </button>
            </>
          )}

          {!isTeacherOrStudent && (
            <div className="flex items-center gap-3 w-full justify-end">
              <div
                className="w-10 h-10 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: settings.primaryColor }}
              >
                {settings.name.charAt(0)}
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                {settings.name}
              </h1>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

const Separator = () => (
  <span className="text-slate-300 font-bold text-xs md:text-lg mb-1 md:mb-4">
    :
  </span>
);

const MenuItem = ({
  icon,
  label,
}: {
  icon: React.ReactNode;
  label: string;
}) => (
  <button className="w-full flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors text-slate-600">
    <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center">
      {icon}
    </div>
    <span className="text-sm font-bold">{label}</span>
  </button>
);

const DesktopProfile = ({
  className = "",
  navigate,
  studentName,
  studentPlan,
  studentAvatar,
}: {
  className?: string;
  navigate: any;
  studentName: string;
  studentPlan: string;
  studentAvatar: string;
}) => (
  <div className={`hidden md:flex items-center gap-4 ${className}`}>
    <button className="p-3 bg-white rounded-2xl text-slate-400 hover:text-[#2563eb] hover:bg-blue-50 transition-all border border-slate-100 relative">
      <Bell size={20} />
      <div className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
    </button>

    <div
      className="flex items-center gap-3 pl-2 hover:cursor-pointer hover:bg-gray-200 rounded-lg p-2 transition-all"
      onClick={() => navigate("/student-dashboard/profile")}
    >
      <div className="w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden border border-slate-100">
         <img
                src={studentAvatar}
                alt="Profile"
                className="w-full h-full object-cover rounded-full"
              />
      </div>
      <div className="flex ">
        <div className="text-right hidden xl:block">
          <p className="text-sm font-bold text-slate-800 leading-none">
            {studentName}
          </p>
          <p className="text-[10px] font-bold text-slate-400 mt-1 uppercase tracking-wider">
            {studentPlan}
          </p>
        </div>
      </div>
    </div>
  </div>
);
