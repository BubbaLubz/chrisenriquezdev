import { Navigate, Route, Routes, useParams } from 'react-router-dom'
import LifecycleDiagram from './components/LifecycleDiagram'
import DetailView from './components/DetailView'
import AboutDetail from './components/AboutDetail'
import { getProjectById } from './data/projects'
import { about } from './data/about'

function ProjectRoute() {
  const { id } = useParams()
  const project = getProjectById(id)
  if (!project) return <Navigate to="/" replace />
  return <DetailView project={project} />
}

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<LifecycleDiagram />} />
      <Route path="/about" element={<AboutDetail about={about} />} />
      <Route path="/project/:id" element={<ProjectRoute />} />
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}
