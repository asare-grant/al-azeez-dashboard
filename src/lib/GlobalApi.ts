// // lib/GlobalApi.ts
// import axios from "axios";

// const GlobalApi = {
//   GetAttendanceList: async (classId: string, month: string) => {
//     const res = await axios.get(`/api/attendance/list?classId=${classId}&month=${month}`);
//     return res.data;
//   },
//   CreateAttendance: async (data: any) => {
//     const res = await axios.post("/api/attendance/create", data);
//     return res.data;
//   },
//   UpdateAttendance: async (data: any) => {
//     const res = await axios.put(`/api/attendance/update/${data.id}`, data);
//     return res.data;
//   },
// };

// export default GlobalApi;




// import axios from "axios";

// const GlobalApi = {
//   GetAttendanceList: async (classId: string, month: string) => {
//     const res = await axios.get(
//       `/api/attendance/list?classId=${classId}&month=${month}`
//     );
//     return res.data.data;
//   },

//   CreateAttendance: async (data: any) => {
//     const res = await axios.post("/api/attendance/create", data);
//     return res.data;
//   },

//   UpdateAttendance: async (data: any) => {
//     const res = await axios.put(`/api/attendance/update/${data.id}`, data);
//     return res.data;
//   },
// };

// export default GlobalApi;


import axios from "axios";

const GlobalApi = {
  GetAttendanceList: async (classId: string, month: string) => {
    const res = await axios.get(
      `/api/attendance/list?classId=${classId}&month=${month}`
    );
    return res.data.data;
  },

  UpsertAttendance: async (data: {
    studentId: string;
    date: string;
    day: number;
    present: boolean;
  }) => {
    const res = await axios.post("/api/attendance/upsert", data);
    return res.data;
  },
};

export default GlobalApi;
