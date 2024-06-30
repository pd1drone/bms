// pages/Controls.js
"use client";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch'; // Import InputSwitch
import axios from 'axios';
import Link from 'next/link';

// Define the type of each room object
interface Room {
  room: string;
  state: number;
}

const Controls = () => {
  const [rooms, setRooms] = useState<Room[]>([]); // Explicitly define the type of rooms state

  useEffect(() => {
    fetchRooms(); // Initial fetch when component mounts
    const intervalId = setInterval(fetchRooms, 100); // Fetch data every 500 milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchRooms = async () => {
    try {

      const device = localStorage.getItem('device');
      if (!device) {
        window.location.href = '/';
        throw new Error('Device IP address not found in localStorage');
      }
      const response = await axios.get(`http://${device}:8081/status`);
      if (!response.data) {
        throw new Error('Failed to fetch data');
      }
      const data = response.data;
      console.log(data);
      // Convert data object to array of Room objects
      const roomsData: Room[] = Object.entries(data).map(([room, state]) => ({ room, state: state as number }));
      // Sort roomsData based on the numeric part of the room field
      roomsData.sort((a, b) => {
        const roomA = parseInt(a.room.replace('room', ''));
        const roomB = parseInt(b.room.replace('room', ''));
        return roomA - roomB;
      });
      setRooms(roomsData);
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleToggle = async (room: string, newState: number, apiState: string) => {
    try {
      const device = localStorage.getItem('device');
      if (!device) {
        throw new Error('Device IP address not found in localStorage');
      }
      const response = await axios.get(`http://${device}:8081/${room}${apiState}`);
      if (response.data) {
        fetchRooms(); 
      } else {
        throw new Error('Failed to update state');
      }
    } catch (error) {
      console.error('Error updating state:', error);
    }
  };

  return (
    <div>
    <div className="px-8 py-4 flex justify-between items-center">
      <h1 className="text-4xl font-black pt-4 text-white-900 tracking-[-0.5px] pb-2">
        Controls
      </h1>
      <div>
        <Link legacyBehavior href="/dashboard">
          <a className="flex items-center text-white text-lg hover:underline">
            <span className="mr-2">&larr;</span> Back
          </a>
        </Link>
      </div>
    </div>
      <div>
        <DataTable value={rooms} size="small" stripedRows tableStyle={{ minWidth: '50rem' }}>
          <Column field="room" header="Room" />
          <Column header="State" body={(rowData) => (
            <InputSwitch
              checked={rowData.state === 1}
              onChange={(e) => {
                console.log(e.value)
                const newState = e.value ? 1 : 0;
                const apiState = e.value ? "on" : "off";
                let roomNumber = rowData.room.replace('room', ''); // Remove 'room' from room number
                handleToggle(roomNumber, newState,apiState.toLowerCase());
                //fetchRooms();
              }}
            />
          )} />
          <Column header="Status" body={(rowData) => (
            <img
              src={rowData.state === 1 ? '/images/light_on.png' : '/images/light_off.png'}
              alt={rowData.state === 1 ? 'Light On' : 'Light Off'}
              style={{
                width: rowData.state === 1 ? '36px' : '32px',
                height: rowData.state === 1 ? '36px' : '32px'
              }}
            />
          )} />
        </DataTable>
      </div>
    </div>
  );
};

export default Controls;
