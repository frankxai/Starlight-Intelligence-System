export type FieldNote = {
  id: string;
  stage: string;
  title: string;
  principle: string;
  detail: string;
  image: string;
  alt: string;
};

export const publicFieldNotes: FieldNote[] = [
  {
    id: "15",
    stage: "Remember",
    title: "The memory keeper",
    principle: "Public memory should preserve context, not just conclusions.",
    detail: "A future reader needs the source, the exception, the owner, and the conditions around the decision.",
    image: "/assets/field-notes/v1/15-memory-keeper.webp",
    alt: "A human archivist and compact white robot preserving illuminated records in a dark mineral archive.",
  },
  {
    id: "16",
    stage: "Convene",
    title: "Protocol as a civic table",
    principle: "Shared rules become real when different people can use them together.",
    detail: "The protocol is a meeting surface for humans, agents, evidence, and the authority to stop.",
    image: "/assets/field-notes/v1/16-protocol-civic-table.webp",
    alt: "A multigenerational group and field robots examining a protocol model around a circular table.",
  },
  {
    id: "17",
    stage: "Attest",
    title: "Attestation at human scale",
    principle: "Proof lives where a person can inspect and affirm it.",
    detail: "The decisive gesture remains close to the source record, visible to the operator who owns the consequence.",
    image: "/assets/field-notes/v1/17-attestation-macro.webp",
    alt: "Close view of a human hand affirming a brass attestation control beside a compact robot.",
  },
  {
    id: "18",
    stage: "Authorize",
    title: "The human gate",
    principle: "Consequential action crosses a named human boundary.",
    detail: "A gate is not ceremonial: it makes responsibility, pause, and refusal part of the system architecture.",
    image: "/assets/field-notes/v1/18-human-gate.webp",
    alt: "A person opening a bright civic doorway while two white robots wait behind the threshold.",
  },
  {
    id: "19",
    stage: "Fork",
    title: "Forkable by design",
    principle: "A living system can be taken apart, understood, and rebuilt locally.",
    detail: "Ownership becomes practical when the parts, interfaces, and operating knowledge remain accessible.",
    image: "/assets/field-notes/v1/19-forkable-by-design.webp",
    alt: "A community workshop where people and several specialized robots rebuild intricate open machinery.",
  },
  {
    id: "20",
    stage: "Return",
    title: "Letters to public memory",
    principle: "The final handoff returns knowledge to the people it serves.",
    detail: "What the system learns becomes a durable, humane record—not a private trail that disappears with the tool.",
    image: "/assets/field-notes/v1/20-public-memory.webp",
    alt: "People and small robots gathering around illuminated public memory shelves under a tree at night.",
  },
];
