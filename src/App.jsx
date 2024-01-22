import {
  Navigate,
  RouterProvider,
  createBrowserRouter,
} from "react-router-dom";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./util/http.js";
import Events from "./components/Events/Events.jsx";
// import EventDetails from "./components/Events/EventDetails.jsx";
import NewEvent from "./components/Events/NewEvent.jsx";
import EditEvent, {loader as preloadEventLoader, action as updateEventAction} from "./components/Events/EditEvent.jsx";
import { Suspense, lazy } from "react";
import LoadingIndicator from "./components/UI/LoadingIndicator.jsx";


const EventDetails = lazy(()=> import("./components/Events/EventDetails.jsx")) 
const router = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/events" />,
  },
  {
    path: "/events",
    element: <Events />,

    children: [
      {
        path: "/events/new",
        element: <NewEvent />,
      },
    ],
  },
  {
    path: "/events/:id",
    element: <Suspense fallback={<LoadingIndicator/>}><EventDetails /></Suspense>,
    // loader: loadEventData,
    id: "event-data",
    children: [
      {
        path: "/events/:id/edit",
        element: <EditEvent />,
        loader:preloadEventLoader,
        action: updateEventAction
      },
    ],
  },
]);

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />;
    </QueryClientProvider>
  );
}

export default App;
