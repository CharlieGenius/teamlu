CREATE TABLE "page_content" (
	"id" integer PRIMARY KEY,
	"content" jsonb NOT NULL,
	"revision" integer DEFAULT 1 NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
