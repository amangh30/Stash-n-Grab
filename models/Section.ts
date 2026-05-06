import mongoose from "mongoose"

const QuestionSchema = new mongoose.Schema({
  questionText: { type: String, required: true },
  options: [{ type: String, required: true }], // Array of 4 strings
  correctOptionIndex: { type: Number, required: true } // 0, 1, 2, or 3
})

const SectionSchema = new mongoose.Schema({
  title: { type: String, required: true },
  collectionId: { type: mongoose.Schema.Types.ObjectId, ref: "Collection", required: true },
  resources: [{ type: mongoose.Schema.Types.ObjectId, ref: "Resource" }],
  questions: [QuestionSchema] // 🔥 Embedded array of MCQs
}, { timestamps: true })

export default mongoose.models.Section || mongoose.model("Section", SectionSchema)