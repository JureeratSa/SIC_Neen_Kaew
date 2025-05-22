import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

export const metadata = {
  title: "WU Comfort Detector",
  description: "This is a sample website built with Next.js.",
  author: "Teerapat Sommaloun",
  keywords: ["Next.js", "JavaScript", "Web Development"],
  language: "en-US",
  robots: "index, follow",
  openGraph: {
    title: "My Awesome Website",
    description: "This is a sample website built with Next.js.",
    url: "https://www.myawesomewebsite.com",
    type: "website",
    images: [
      {
        url: "https://www.myawesomewebsite.com/og-image.jpg",
        width: 1200,
        height: 630,
        alt: "My Awesome Website"
      }
    ]
  }
};

export const viewport = {
  themeColor: "#ffffff"
}

const layout = ({ children }) => {
  return (
    <html lang="en">
      <body className="flex flex-col min-h-screen bg-white">
        <Navbar />
        <main className="flex-grow">{children}</main>
        <Footer />
      </body>
    </html>
  );
};

export default layout;