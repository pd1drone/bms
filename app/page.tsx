"use client";
import Image from "next/image";
import React, { useEffect, useState } from 'react';
import { Inter } from 'next/font/google'
import './globals.css'
import axios from 'axios';
import { PrimeReactProvider, PrimeReactContext } from 'primereact/api';

const inter = Inter({ subsets: ['latin'] })


export default function Home() {

  const [device, setDevice] = useState('');
  const [deviceError, setDeviceError] = useState<string | null>(null);

  const handleDeviceConnection = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    try {
      console.log(device)
      const response = await axios.get(`http://${device}:8081/check`);

      if (response.status === 200) {
        localStorage.setItem('device', device);
        window.location.href = '/dashboard'; // Redirect to dashboard
      } else {
        setDeviceError("Wrong Device IP Address. Please enter the correct one.");

        // Clear error message after 3 seconds
        setTimeout(() => {
          setDeviceError(null);
        }, 3000);
      }
    } catch (error) {
      console.error('Error connecting to device:', error);
      setDeviceError("Error connecting to device. Please check your network connection.");

      // Clear error message after 3 seconds
      setTimeout(() => {
        setDeviceError(null);
      }, 3000);
    }
  };

  return (
    <PrimeReactProvider>
    <main className="h-screen">
      <Image
        className="absolute -z-20"
        src={"/images/bms.png"}
        fill={true}
        objectFit="cover"
        alt="bg-login"
      />
      <div className="flex flex-col md:flex-row items-center justify-center gap-36 h-screen">
        <div className="w-full max-w-sm ">
          <div className="aspect-square w-full max-w-[100px] md:max-w-[100px] relative m-auto mb-5">

          </div>

          <div className="mb-5 text-center pb-24">
          </div>

          <div>
            <form onSubmit={(e) => handleDeviceConnection(e)} className="flex flex-col gap-4">
                {deviceError && (
                <div role="alert" className="login-error">
                    <div className="bg-red-500 text-white font-bold rounded-t px-4 py-2">
                    Error:
                    </div>
                    <div className="border border-t-0 border-red-400 rounded-b bg-red-100 px-4 py-3 text-red-700">
                    <p className="error-message text-black">{deviceError}</p>
                    </div>
                </div>
                )}
                <input
                  className="px-2 py-2 rounded-md text-black border-2 border-black"
                  type="text"
                  name="username"
                  id="username"
                  placeholder="Device IP Address"
                  pattern="^[0-9.]*$"
                  value={device}
                  onKeyDown={(e) => {
                    const allowedKeys = [
                      "Backspace",
                      "Delete",
                      "ArrowLeft",
                      "ArrowRight",
                      "Tab",
                      "Enter",
                      "."
                    ];

                    if (
                      !allowedKeys.includes(e.key) &&
                      (e.key < "0" || e.key > "9") &&
                      !(e.ctrlKey && e.key === "a")
                    ) {
                      e.preventDefault();
                    }
                  }}
                  onChange={(e) => setDevice(e.target.value)}
                />
                <button
                  className="uppercase px-2 py-2 rounded-md bg-red-600 text-white font-medium hover:bg-red-800"
                  type="submit"
                >
                  Connect
                </button>
            </form>
            </div>

        </div>
      </div>
    </main>
    </PrimeReactProvider>
  );
}

