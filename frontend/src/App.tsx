import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom'; // Убрал Navigate из импорта тут, так как он внутри
import { AuthProvider } from './context/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute'; // ИМПОРТ ЗАЩИТЫ

import { LoginPage } from './pages/LoginPage';
import { AdminLayout } from './layouts/AdminLayout';
import { AdminLecturesPage } from './pages/AdminLecturesPage';
import { LectureEditPage } from './pages/LectureEditPage';
import { AdminTestsPage } from './pages/AdminTestsPage';
import { TestEditPage } from './pages/TestEditPage';
import { AdminStatsPage } from './pages/AdminStatsPage';
import { StudentDashboardPage } from './pages/StudentDashboardPage';
import { StudentLectureView } from './pages/StudentLectureView';
import { StudentTestTakePage } from './pages/StudentTestTakePage';

export default function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<LoginPage />} />
          
          {/* --- ЗАЩИЩЕННАЯ ЗОНА АДМИНА --- */}
          <Route element={<ProtectedRoute allowedRole="admin" />}>
            <Route path="/admin" element={<AdminLayout />}>
              {/* index route для редиректа внутри админки можно сделать так, или в ProtectedRoute */}
              <Route index element={<AdminLecturesPage />} /> 
              
              <Route path="lectures" element={<AdminLecturesPage />} />
              <Route path="lectures/new" element={<LectureEditPage />} />
              <Route path="lectures/edit/:id" element={<LectureEditPage />} />

              <Route path="tests" element={<AdminTestsPage />} />
              <Route path="tests/new" element={<TestEditPage />} />
              <Route path="tests/edit/:id" element={<TestEditPage />} />

              <Route path="stats" element={<AdminStatsPage />} />
            </Route>
          </Route>

          {/* --- ЗАЩИЩЕННАЯ ЗОНА СТУДЕНТА --- */}
          <Route element={<ProtectedRoute allowedRole="student" />}>
            <Route path="/student" element={<StudentDashboardPage />} />
            <Route path="/student/lecture/:id" element={<StudentLectureView />} />
            <Route path="/student/test/:id" element={<StudentTestTakePage />} />
          </Route>

        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}