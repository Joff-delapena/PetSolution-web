import React from "react";

const Footer = () => {
  return (
    <footer className="bg-gray-200 px-4 py-6 mt-10">
      <div className="max-w-6xl mx-auto text-center">
        <p className="text-gray-600 text-sm mb-4">
          © 2025 Pet Solution - All Rights Reserved
        </p>

        {/* Download App Section */}
        <div className="mt-4">
          <p className="text-gray-700 font-medium mb-2">
            Download Our Mobile App
          </p>
          <div className="flex justify-center items-center gap-4">
            <img
              src="/images/google-play-badge.png" // Put this image in your public/images folder
              alt="Get it on Ana's Play"
              className="h-12"
            />
            <img
              src="/images/app-store-badge.png" // Put this image in your public/images folder
              alt="Download on the Carl's Store"
              className="h-12"
            />
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
