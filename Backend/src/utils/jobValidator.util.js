const { z } = require("zod");

const jobSchema = z.object({
  sourceId: z.string({ required_error: "sourceId is required" }),
  source: z.string({ required_error: "source is required" }),
  title: z.string({ required_error: "title is required" }).min(1, "title cannot be empty"),
  company: z.string().optional(),
  location: z.string().optional(),
  url: z.string({ required_error: "url is required" }).url("Must be a valid URL"),
  postedAt: z.coerce.date().optional(),
});

const validateJob = (job) => {
  const result = jobSchema.safeParse(job);

  if (result.success) {
    return result.data;
  } else {
    console.warn(
      `[Warning] Job validation failed (sourceId: ${job.sourceId || "unknown"}):`,
      result.error.issues.map(e => e.message).join(", ")
    );
    return null;
  }
};

module.exports = {
  validateJob,
  jobSchema,
};
