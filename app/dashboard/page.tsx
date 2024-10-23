// pages/Dashboard.js
"use client";
import Link from 'next/link';
import "primereact/resources/themes/lara-light-cyan/theme.css";
import { useEffect, useState } from 'react';
import { Chart } from "primereact/chart";
import { signOut } from "firebase/auth";
import { ref, onValue, get, update } from "firebase/database";
import { auth, database } from '../firebase'; // Import the database and auth

// Define the type of each room object
interface Room {
  room: string;
  state: boolean; // Update state to boolean based on Firebase data
}

const Dashboard = () => {
  const [rooms, setRooms] = useState<Room[]>([]);
  const [chartData, setChartData] = useState<any>({});
  const [chartOptions, setChartOptions] = useState<any>({});
  const [loggedInUsers, setLoggedInUsers] = useState<number>(0); // New state for logged-in users

  useEffect(() => {
    fetchRooms(); // Initial fetch when component mounts
    fetchLoggedInUsers(); // Fetch logged-in users
  }, []);

  useEffect(() => {
    updateChartData();
  }, [rooms]);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      
      // Update the logged-in user count
      const roomsRef = ref(database, '/'); // Reference to the root of your Firebase database
      const snapshot = await get(roomsRef);
      const data = snapshot.val();
      const currentCount = data.loggedInUsers || 0;
  
      // Decrement the counter
      await update(roomsRef, { loggedInUsers: Math.max(currentCount - 1, 0) }); // Ensure the count doesn't go below zero
      window.location.href = '/';
    } catch (error) {
      console.error('Error logging out or updating counter:', error);
    }
  };

  const fetchRooms = () => {
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
        // Convert data object to array of Room objects
        const roomsData: Room[] = Object.entries(data).map(([room, state]) => ({ room, state: state as boolean }));
        // Sort roomsData based on the numeric part of the room field
        roomsData.sort((a, b) => {
          const roomA = parseInt(a.room.replace('Room', ''));
          const roomB = parseInt(b.room.replace('Room', ''));
          return roomA - roomB;
        });
        setRooms(roomsData);
      });
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  };

  const fetchLoggedInUsers = () => {
    // Example fetch for logged-in users; update this based on your actual data structure
    const usersRef = ref(database, '/'); // Adjust the path if necessary
    onValue(usersRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        setLoggedInUsers(data.loggedInUsers); // Assuming data is an array of logged-in users
      } else {
        setLoggedInUsers(0);
      }
    });
  };

  const updateChartData = () => {
    const onCount = rooms.filter(room => room.state === true).length;
    const offCount = rooms.filter(room => room.state === false).length;

    const updatedChartData = {
      labels: [
        'Bulbs OFF',
        'Bulbs ON'
      ],
      datasets: [{
        label: 'Bulb Status',
        data: [offCount, onCount],
        backgroundColor: [
          'rgb(128, 128, 128)',  // Dark gray for Bulbs OFF
          'rgb(255, 255, 0)'     // Yellow for Bulbs ON
        ],
        hoverOffset: 4
      }]
    };

    setChartData(updatedChartData);
  };

  const refreshData = () => {
    fetchRooms();
    fetchLoggedInUsers();
  };

  const configPieChart = {
    type: "pie",
    data: chartData,
    options: {
      responsive: true,
      plugins: {
        legend: {
          position: "top",
        },
        title: {
          display: true,
          text: "Number of Bulbs",
        },
      },
    },
  };

  return (
    <div>
      <div className="px-8 py-4 flex justify-between items-center">
        <h1 className="text-4xl font-black pt-4 text-white-900 tracking-[-0.5px] pb-2">
          Dashboard
        </h1>
        <div>
          <Link legacyBehavior href="/controls">
            <a className="flex items-center text-white text-lg hover:underline">
              Controls <span className="mr-2">&rarr;</span>
            </a>
          </Link>
          <a
            className="flex items-center text-white text-lg hover:underline cursor-pointer"
            onClick={handleLogout}
          >
            <span className="mr-2">&larr;</span> Logout
          </a>
        </div>
      </div>

      <div className="px-8 pb-1 flex justify-center bg-white pt-2">
        <button className="bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded" onClick={refreshData}>
          Refresh Data
        </button>
      </div>

      <div className="grid grid-cols-5 grid-rows-2 gap-1 bg-white pt-10 pb-10 mb-10">
        <div className="card row-span-3 col-start-2 col-span-2" style={{ height: '500px' }}>
          <Chart
            type="pie"
            data={chartData}
            options={configPieChart.options}
            style={{ height: '100%' }} // Adjust chart height if needed
          />
        </div>
        <div className="col-start-4 row-start-1 col-span-1">
          <div>
            <h1 className="text-5xl font-medium text-red-900">
              {chartData.datasets && chartData.datasets[0].data[0]}
            </h1>
          </div>
          <div>
            <p className="text-sm font-medium w-full text-black">
              Number of Switched-off Bulbs
            </p>
          </div>
        </div>
        <div className="col-start-4 row-start-2 col-span-1">
          <div>
            <h1 className="text-5xl font-medium text-yellow-900">
              {chartData.datasets && chartData.datasets[0].data[1]}
            </h1>
          </div>
          <div>
            <p className="text-sm font-medium w-full text-black">
              Number of Switched-on Bulbs
            </p>
          </div>
        </div>
        <div className="col-start-4 row-start-3 col-span-1">
          <div>
            <h1 className="text-5xl font-medium text-blue-900">
              {loggedInUsers}
            </h1>
          </div>
          <div>
            <p className="text-sm font-medium w-full text-black">
              Number of Logged-in Users
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
