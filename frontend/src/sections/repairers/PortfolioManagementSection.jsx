import { useState } from "react";

import RepairProjectForm from "@/components/features/RepairProjectForm";
import ManageProjectCard from "@/components/features/ManageProjectCard";
import DeleteConfirmModal from "@/components/ui/DeleteConfirmModal";

import { repairers } from "@/services/repairerData";

function PortfolioManagementSection() {
  const repairer = repairers[0];

  const [projects, setProjects] = useState(
    repairer.projects
  );

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);
  const [projectToDelete, setProjectToDelete] = useState(null);

  function handleAddProject() {
    setEditingProject(null);
    setShowForm(true);
  }

  function handleEditProject(project) {
    setEditingProject(project);
    setShowForm(true);
  }

  function handleSaveProject(projectData) {
    if (editingProject) {
      setProjects((current) =>
        current.map((project) =>
          project.id === editingProject.id
            ? {
                ...project,
                ...projectData,
              }
            : project
        )
      );
    } else {
      setProjects((current) => [
        ...current,
        {
          ...projectData,
          id: Date.now(),
        },
      ]);
    }

    setEditingProject(null);
    setShowForm(false);
  }

  function handleDeleteProject() {
    setProjects((current) =>
      current.filter(
        (project) =>
          project.id !== projectToDelete.id
      )
    );

    setProjectToDelete(null);
  }

  function handleCancelForm() {
    setEditingProject(null);
    setShowForm(false);
  }

  return (
    <section className="mx-auto max-w-6xl px-6 py-12 sm:py-20">

      {/* HEADER */}
      <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">

        <div>

          <p className="text-xs font-bold uppercase tracking-[0.2em] text-blue-400">
            Repairer Dashboard
          </p>

          <h1 className="mt-3 text-4xl font-black tracking-tight">
            My Repair Projects
          </h1>

          <p className="mt-3 max-w-2xl text-slate-500">
            Build your repair portfolio and show customers
            what you can do.
          </p>

        </div>

        {!showForm && (
          <button
            type="button"
            onClick={handleAddProject}
            className="rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
          >
            + Add Project
          </button>
        )}

      </div>

      {/* FORM */}
      {showForm && (
        <div className="mt-10">
          <RepairProjectForm
            project={editingProject}
            onSave={handleSaveProject}
            onCancel={handleCancelForm}
          />
        </div>
      )}

      {/* PROJECTS */}
      {!showForm && (
        <>

          <div className="mt-10 flex items-center justify-between border-b border-white/10 pb-5">

            <div>
              <h2 className="font-bold">
                Your portfolio
              </h2>

              <p className="mt-1 text-sm text-slate-600">
                {projects.length}{" "}
                {projects.length === 1
                  ? "project"
                  : "projects"}
              </p>
            </div>

          </div>

          {projects.length > 0 ? (

            <div className="mt-6 grid gap-5 md:grid-cols-2 lg:grid-cols-3">

              {projects.map((project) => (
                <ManageProjectCard
                  key={project.id}
                  project={project}
                  onEdit={handleEditProject}
                  onDelete={setProjectToDelete}
                />
              ))}

            </div>

          ) : (

            <div className="mt-6 rounded-3xl border border-dashed border-white/10 px-6 py-24 text-center">

              <div className="text-5xl">
                🔧
              </div>

              <h2 className="mt-5 text-xl font-bold">
                No projects yet
              </h2>

              <p className="mx-auto mt-2 max-w-md text-sm leading-6 text-slate-500">
                Add your first completed repair to start
                building your portfolio.
              </p>

              <button
                type="button"
                onClick={handleAddProject}
                className="mt-6 rounded-xl bg-white px-5 py-3 text-sm font-bold text-slate-950 transition hover:bg-slate-200"
              >
                + Add Your First Project
              </button>

            </div>

          )}

        </>
      )}

      {/* DELETE MODAL */}
      <DeleteConfirmModal
        project={projectToDelete}
        onConfirm={handleDeleteProject}
        onCancel={() => setProjectToDelete(null)}
      />

    </section>
  );
}

export default PortfolioManagementSection;