import React from 'react';

export default function Contact() {
  return (
    <div className="px-8 py-10 max-w-6xl mx-auto">
      <h1 className="text-4xl font-bold mb-6">Disponibilité et contacts</h1>
      <p className="text-base-content/80 leading-relaxed text-lg mb-4">
        Je suis disponible pour des missions, des collaborations et des formations.
        Contactez-moi pour discuter de vos besoins et définir ensemble le bon cadre.
      </p>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-3xl border border-base-content/10 bg-base-200/60 p-6">
          <h2 className="text-xl font-semibold mb-3">Email</h2>
          <p>contact@durinfo.one</p>
        </div>
        <div className="rounded-3xl border border-base-content/10 bg-base-200/60 p-6">
          <h2 className="text-xl font-semibold mb-3">Téléphone</h2>
          <p>+33 6 12 34 56 78</p>
        </div>
      </div>
    </div>
  );
}
