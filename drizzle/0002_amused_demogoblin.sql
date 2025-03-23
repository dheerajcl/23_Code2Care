CREATE TABLE "donation" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"amount" numeric NOT NULL,
	"donation_type" text NOT NULL,
	"donation_purpose" text NOT NULL,
	"payment_method" text NOT NULL,
	"payment_status" text DEFAULT 'pending' NOT NULL,
	"transaction_id" text,
	"donor_name" text NOT NULL,
	"donor_email" text NOT NULL,
	"donor_phone" text NOT NULL,
	"donor_address" text,
	"pan_number" text,
	"donor_message" text,
	"receive_updates" boolean DEFAULT false,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	"organization_id" uuid
);
--> statement-breakpoint
ALTER TABLE "donation" ADD CONSTRAINT "donation_organization_id_organization_id_fk" FOREIGN KEY ("organization_id") REFERENCES "public"."organization"("id") ON DELETE no action ON UPDATE no action;