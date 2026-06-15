import { Navigate, createBrowserRouter } from 'react-router-dom';
import { AdminLayout } from '@/components/layouts/AdminLayout';
import { GuestLayout } from '@/components/layouts/GuestLayout';
import { EventTypeCreatePage } from '@/features/admin/EventTypeCreatePage';
import { EventTypeEditPage } from '@/features/admin/EventTypeEditPage';
import { EventTypesListPage } from '@/features/admin/EventTypesListPage';
import { UpcomingBookingsPage } from '@/features/admin/UpcomingBookingsPage';
import { BookingPage } from '@/features/guest/BookingPage';
import { EventTypeCatalogPage } from '@/features/guest/EventTypeCatalogPage';
import { MyBookingsPage } from '@/features/guest/MyBookingsPage';

export const router = createBrowserRouter([
  {
    element: <GuestLayout />,
    children: [
      { index: true, element: <EventTypeCatalogPage /> },
      { path: 'book/:eventTypeId', element: <BookingPage /> },
      { path: 'my-bookings', element: <MyBookingsPage /> },
    ],
  },
  {
    path: 'admin',
    element: <AdminLayout />,
    children: [
      { index: true, element: <Navigate to="/admin/event-types" replace /> },
      { path: 'event-types', element: <EventTypesListPage /> },
      { path: 'event-types/new', element: <EventTypeCreatePage /> },
      { path: 'event-types/:id/edit', element: <EventTypeEditPage /> },
      { path: 'bookings', element: <UpcomingBookingsPage /> },
    ],
  },
  { path: '*', element: <Navigate to="/" replace /> },
]);
