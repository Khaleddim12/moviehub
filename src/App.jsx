import React from "react";
import NavBar from "./components/NavBar";
import MainLayout from "./layouts/MainLayout";

// pages
import HomePage from './pages/HomePage'
import NotFoundPage from "./pages/NotFoundPage";
import MovieDetailsPage from "./pages/MovieDetailsPage";
import SearchPage from "./pages/SearchPage";
import ActorDetailsPage from "./pages/ActorDetailsPage";

//routing
import {
  Route,
  createBrowserRouter,
  createRoutesFromElements,
  RouterProvider,
} from "react-router";

const App = () => {
  const router = createBrowserRouter(
    createRoutesFromElements(
        <Route path="/" element={<MainLayout />}>
        <Route index element={<HomePage />} />
        <Route path="movie/:id" element={<MovieDetailsPage />} />
        <Route path="actor/:id" element={<ActorDetailsPage />} />
        <Route path="/search/:query" element={<SearchPage />} />
        <Route path="*" element={<NotFoundPage />} />
      </Route>,
    ),
    {
      basename: "/moviehub"
    }
  );

  return <RouterProvider router={router} />;
};

export default App;
