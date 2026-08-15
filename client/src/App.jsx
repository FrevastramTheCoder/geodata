import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import Layout from "./components/Layout.jsx";
import { Loading } from "./components/ui.jsx";
import Home from "./pages/Home.jsx";
import Explore from "./pages/Explore.jsx";
import Categories from "./pages/Categories.jsx";
import Sources from "./pages/Sources.jsx";
import SourceDetail from "./pages/SourceDetail.jsx";
import DatasetDetail from "./pages/DatasetDetail.jsx";
import Tanzania from "./pages/Tanzania.jsx";
import Global from "./pages/Global.jsx";
import Latest from "./pages/Latest.jsx";
import Popular from "./pages/Popular.jsx";
import About from "./pages/About.jsx";
import Submit from "./pages/Submit.jsx";
import Login from "./pages/Login.jsx";
import Dashboard from "./pages/Dashboard.jsx";
import Profile from "./pages/Profile.jsx";
import Boundaries from "./pages/Boundaries.jsx";
const Training = lazy(() => import("./pages/Training.jsx"));
const CourseDetail = lazy(() => import("./pages/CourseDetail.jsx"));
const Labs = lazy(() => import("./pages/Labs.jsx"));
const WhatWeDo = lazy(() => import("./pages/WhatWeDo.jsx"));
const Projects = lazy(() => import("./pages/Projects.jsx"));
const Resources = lazy(() => import("./pages/Resources.jsx"));
import Community from "./pages/Community.jsx";
import Contact from "./pages/Contact.jsx";
import Opportunities from "./pages/Opportunities.jsx";
import Research from "./pages/Research.jsx";
import Certificates from "./pages/Certificates.jsx";
import VerifyCertificate from "./pages/VerifyCertificate.jsx";
import SoftwareHome from "./pages/SoftwareHome.jsx";
import SoftwareCategories from "./pages/SoftwareCategories.jsx";
import SoftwareCategoryDetail from "./pages/SoftwareCategoryDetail.jsx";
import SoftwareDetail from "./pages/SoftwareDetail.jsx";
import FreeSoftware from "./pages/FreeSoftware.jsx";
import StudentSoftware from "./pages/StudentSoftware.jsx";
import SoftwareCompare from "./pages/SoftwareCompare.jsx";
import SoftwareSubmit from "./pages/SoftwareSubmit.jsx";
import NotFound from "./pages/NotFound.jsx";

export default function App() {
  return (
    <Suspense fallback={<Loading label="Loading GeoBrains Academy..." />}>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<Home />} />
          <Route path="explore" element={<Explore />} />
          <Route path="data" element={<Explore />} />
          <Route path="categories" element={<Categories />} />
          <Route path="sources" element={<Sources />} />
          <Route path="sources/:slug" element={<SourceDetail />} />
          <Route path="datasets/:id" element={<DatasetDetail />} />
          <Route path="tanzania" element={<Tanzania />} />
          <Route path="global" element={<Global />} />
          <Route path="latest" element={<Latest />} />
          <Route path="popular" element={<Popular />} />
          <Route path="about" element={<About />} />
          <Route path="submit" element={<Submit />} />
          <Route path="login" element={<Login />} />
          <Route path="dashboard" element={<Dashboard />} />
          <Route path="profile" element={<Profile />} />
          <Route path="training" element={<Training />} />
          <Route path="training/:slug" element={<CourseDetail />} />
          <Route path="what-we-do" element={<WhatWeDo />} />
          <Route path="labs" element={<Labs />} />
          <Route path="projects" element={<Projects />} />
          <Route path="community" element={<Community />} />
          <Route path="resources" element={<Resources />} />
          <Route path="contact" element={<Contact />} />
          <Route path="opportunities" element={<Opportunities />} />
          <Route path="research" element={<Research />} />
          <Route path="certificates" element={<Certificates />} />
          <Route path="verify/:certificateId" element={<VerifyCertificate />} />
          <Route path="boundaries" element={<Boundaries />} />
          <Route path="software" element={<SoftwareHome />} />
          <Route path="software/categories" element={<SoftwareCategories />} />
          <Route path="software/categories/:slug" element={<SoftwareCategoryDetail />} />
          <Route path="software/free" element={<FreeSoftware />} />
          <Route path="software/students" element={<StudentSoftware />} />
          <Route path="software/compare" element={<SoftwareCompare />} />
          <Route path="software/submit" element={<SoftwareSubmit />} />
          <Route path="software/:slug" element={<SoftwareDetail />} />
          <Route path="*" element={<NotFound />} />
        </Route>
      </Routes>
    </Suspense>
  );
}
