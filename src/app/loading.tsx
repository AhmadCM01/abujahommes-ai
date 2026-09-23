import React from 'react'
import Image from 'next/image'

export default function GlobalLoading() {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F5EDD6] select-none p-4">
      {/* Centered Pulsing Logo Icon (80px) */}
      <div className="relative w-20 h-20 mb-4 animate-pulse">
        <Image
          src="/logo/logo-icon.svg"
          alt="AbujaHommes AI"
          fill
          sizes="80px"
          priority
        />
      </div>

      {/* Wordmark */}
      <h2 className="text-lg font-bold text-[#1A1A1A] tracking-tight">
        AbujaHommes AI
      </h2>
      <p className="text-xs text-[#5C5C5C] mt-0.5 mb-6">
        Property Intelligence for Abuja
      </p>

      {/* Thin animated olive green progress bar */}
      <div className="w-48 h-1 bg-[#EDE0C4] rounded-full overflow-hidden">
        <div className="h-full bg-[#2D5A3D] rounded-full animate-[pulse_1s_ease-in-out_infinite] w-3/4 mx-auto" />
      </div>
    </div>
  )
}
