/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",      // ไฟล์ในโฟลเดอร์ pages
    "./components/**/*.{js,ts,jsx,tsx,mdx}", // ไฟล์ในโฟลเดอร์ components
    "./app/**/*.{js,ts,jsx,tsx,mdx}",        // ไฟล์ในโฟลเดอร์ app
  ],
  theme: {
    extend: {
      colors: {
        primary: "#3490dc",       // สีหลัก
        secondary: "#ffed4a",     // สีรอง
        accent: "#38b2ac",        // สีเน้น
        neutral: "#3d4451",       // สีพื้นหลังหรือเนื้อหา
        "base-100": "#ffffff",    // สีพื้นหลังหลัก
        info: "#209cee",          // สี info
        success: "#48bb78",       // สี success
        warning: "#f6ad55",       // สี warning
        error: "#f56565",         // สี error
        purple: "#7b5aa6",
        purple1: "#624E88",        // สีม่วง
        black: "#000000",
        navy: "#2A528A",
        girl: "#FF90BC",
        man: "#51829B",
        background: "var(--background)", // สีจาก CSS Variables
        foreground: "var(--foreground)", // สีจาก CSS Variables
        comfort0: "#00BF63",
        comfort1: "#7EDA57",
        comfort2: "#94AABF",
        comfort3: "#FF914D",
        comfort4: "#FF5757",
      },
    },
  },
  plugins: [
    require("daisyui"), // เพิ่ม DaisyUI เป็น plugin
  ],
};
