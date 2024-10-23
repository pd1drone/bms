"use client";
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { useEffect, useState } from 'react';
import { DataTable } from 'primereact/datatable';
import { Column } from 'primereact/column';
import { InputSwitch } from 'primereact/inputswitch'; // Import InputSwitch
import Link from 'next/link';
import { ref, onValue, set } from 'firebase/database';
import { database } from '../firebase'; // Import your Firebase database

// Define the type of each room object
interface Room {
  room: string;
  state: boolean;
}

const Controls = () => {
  const [rooms, setRooms] = useState<Room[]>([]); // Explicitly define the type of rooms state
  const [allOn, setAllOn] = useState(false); // State for the top-level toggle switch

  useEffect(() => {
    fetchRooms(); // Initial fetch when component mounts
    const intervalId = setInterval(fetchRooms, 500); // Fetch data every 500 milliseconds

    // Clear the interval on component unmount
    return () => clearInterval(intervalId);
  }, []);

  const fetchRooms = async () => {
    try {
      const user = localStorage.getItem('user');
      if (!user) {
        window.location.href = '/';
      }
      const roomsRef = ref(database, '/'); // Reference to the root of your Firebase database
      onValue(roomsRef, (snapshot) => {
        const data = snapshot.val();
        if (!data) {
          throw new Error('Failed to fetch data');
        }
        console.log(data);
        // Convert data object to array of Room objects, excluding 'loggedInUsers'
        const roomsData: Room[] = Object.entries(data)
          .filter(([key]) => key.startsWith('Room')) // Filter out only room entries
          .map(([room, state]) => ({ room, state: state as boolean }));
        // Sort roomsData based on the numeric part of the room field
        roomsData.sort((a, b) => {
          const roomA = parseInt(a.room.replace('Room', ''));
          const roomB = parseInt(b.room.replace('Room', ''));
          return roomA - roomB;
        });
        setRooms(roomsData);
        
        // Check if all rooms are on or off to set the toggle switch state
        const allAreOn = roomsData.every(room => room.state === true);
        setAllOn(allAreOn);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const handleToggle = async (room: string, newState: boolean) => {
    try {
      const roomRef = ref(database, `/${room}`); // Reference to the specific room in Firebase
      await set(roomRef, newState); // Directly set the state
      fetchRooms(); // Refresh the data after update
    } catch (error) {
      console.error('Error updating state:', error);
    }
  };

  const handleAllToggle = async (value: boolean) => {
    try {
      const updates: Record<string, boolean> = rooms.reduce((acc, { room }) => {
        acc[room] = value; // Update each room state to the new value
        return acc;
      }, {} as Record<string, boolean>);

      await set(ref(database, '/'), updates); // Update all rooms at once
      setAllOn(value); // Set the top-level toggle state
    } catch (error) {
      console.error('Error toggling all lights:', error);
    }
  };

  return (
    <div>
      <div className="px-8 py-4 flex justify-between items-center">
        <h1 className="text-4xl font-black pt-4 text-white-900 tracking-[-0.5px] pb-2">
          Controls
        </h1>
        <div className="flex items-center">
          <span className="mr-3 text-lg text-white">All Lights</span>
          <InputSwitch
            checked={allOn}
            onChange={(e) => handleAllToggle(e.value)}
          />
        </div>
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
              checked={rowData.state}
              onChange={(e) => {
                const newState = e.value;
                handleToggle(rowData.room, newState);
              }}
            />
          )} />
          <Column header="Status" body={(rowData) => (
            <img
              src={rowData.state ? '/images/light_on.png' : '/images/light_off.png'}
              alt={rowData.state ? 'Light On' : 'Light Off'}
              style={{
                width: rowData.state ? '36px' : '32px',
                height: rowData.state ? '36px' : '32px'
              }}
            />
          )} />
        </DataTable>
      </div>
    </div>
  );
};

export default Controls;
