-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('PUBLIC', 'OWNER', 'TENANT', 'ADMIN');

-- CreateEnum
CREATE TYPE "UserStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED');

-- CreateEnum
CREATE TYPE "UserType" AS ENUM ('OWNER', 'TENANT');

-- CreateEnum
CREATE TYPE "NoticeType" AS ENUM ('GENERAL', 'URGENT', 'MAINTENANCE', 'EVENT');

-- CreateEnum
CREATE TYPE "Visibility" AS ENUM ('PUBLIC', 'REGISTERED', 'ADMIN');

-- CreateEnum
CREATE TYPE "EventType" AS ENUM ('FESTIVAL', 'SPORTS', 'CULTURAL', 'MEETING', 'SOCIAL', 'OTHER');

-- CreateEnum
CREATE TYPE "ParticipationType" AS ENUM ('INDIVIDUAL', 'TEAM');

-- CreateEnum
CREATE TYPE "RegistrationStatus" AS ENUM ('REGISTERED', 'WAITLIST', 'CANCELLED');

-- CreateEnum
CREATE TYPE "VehicleType" AS ENUM ('CAR', 'BIKE', 'SCOOTER', 'OTHER');

-- CreateEnum
CREATE TYPE "MarketplaceCategory" AS ENUM ('SELL', 'RENT', 'SERVICE', 'OTHER');

-- CreateEnum
CREATE TYPE "AdStatus" AS ENUM ('ACTIVE', 'SOLD', 'REMOVED');

-- CreateEnum
CREATE TYPE "ContactPreference" AS ENUM ('PHONE', 'EMAIL', 'BOTH');

-- CreateEnum
CREATE TYPE "ComplaintCategory" AS ENUM ('MAINTENANCE', 'SECURITY', 'CLEANLINESS', 'NOISE', 'PARKING', 'OTHER');

-- CreateEnum
CREATE TYPE "Priority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');

-- CreateEnum
CREATE TYPE "ComplaintStatus" AS ENUM ('SUBMITTED', 'ASSIGNED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED');

-- CreateEnum
CREATE TYPE "ServiceCategory" AS ENUM ('DOCTOR', 'PLUMBER', 'ELECTRICIAN', 'CARPENTER', 'PAINTER', 'INTERNET_PROVIDER', 'PEST_CONTROL', 'HOUSEKEEPING', 'TUITION', 'OTHER');

-- CreateEnum
CREATE TYPE "ApprovalStatus" AS ENUM ('PENDING', 'PUBLISHED', 'REJECTED');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "phone_number" VARCHAR(15),
    "role" "UserRole" NOT NULL DEFAULT 'PUBLIC',
    "status" "UserStatus" NOT NULL DEFAULT 'PENDING',
    "building_id" TEXT,
    "flat_id" TEXT,
    "user_type" "UserType",
    "profile_image_url" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "approved_by" TEXT,
    "approved_at" TIMESTAMP(3),

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "buildings" (
    "id" TEXT NOT NULL,
    "name" VARCHAR(100) NOT NULL,
    "building_code" VARCHAR(10) NOT NULL,
    "total_floors" INTEGER,
    "description" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "buildings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "flats" (
    "id" TEXT NOT NULL,
    "building_id" TEXT NOT NULL,
    "flat_number" VARCHAR(20) NOT NULL,
    "floor_number" INTEGER,
    "bhk_type" VARCHAR(10),
    "owner_id" TEXT,
    "current_tenant_id" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "flats_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "notices" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "content" TEXT NOT NULL,
    "notice_type" "NoticeType" NOT NULL,
    "visibility" "Visibility" NOT NULL DEFAULT 'PUBLIC',
    "published" BOOLEAN NOT NULL DEFAULT false,
    "attachment_urls" JSONB,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "notices_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "events" (
    "id" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT,
    "event_type" "EventType" NOT NULL,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "venue" VARCHAR(200),
    "registration_required" BOOLEAN NOT NULL DEFAULT false,
    "registration_start_date" TIMESTAMP(3),
    "registration_end_date" TIMESTAMP(3),
    "participation_type" "ParticipationType",
    "max_participants" INTEGER,
    "published" BOOLEAN NOT NULL DEFAULT false,
    "image_url" TEXT,
    "created_by" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "published_at" TIMESTAMP(3),

    CONSTRAINT "events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "event_registrations" (
    "id" TEXT NOT NULL,
    "event_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "team_members" JSONB,
    "additional_notes" TEXT,
    "registration_status" "RegistrationStatus" NOT NULL DEFAULT 'REGISTERED',
    "registered_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "event_registrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "vehicles" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "vehicle_number" VARCHAR(20) NOT NULL,
    "vehicle_type" "VehicleType" NOT NULL,
    "brand" VARCHAR(50),
    "model" VARCHAR(50),
    "color" VARCHAR(30),
    "parking_slot" VARCHAR(20),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "vehicles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "marketplace_ads" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "MarketplaceCategory" NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "price" DECIMAL(10,2),
    "images" JSONB,
    "status" "AdStatus" NOT NULL DEFAULT 'ACTIVE',
    "contact_preference" "ContactPreference" NOT NULL DEFAULT 'BOTH',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "sold_at" TIMESTAMP(3),

    CONSTRAINT "marketplace_ads_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaints" (
    "id" TEXT NOT NULL,
    "complaint_number" VARCHAR(20) NOT NULL,
    "user_id" TEXT NOT NULL,
    "category" "ComplaintCategory" NOT NULL,
    "subject" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "priority" "Priority" NOT NULL DEFAULT 'MEDIUM',
    "status" "ComplaintStatus" NOT NULL DEFAULT 'SUBMITTED',
    "assigned_to" TEXT,
    "assigned_by" TEXT,
    "attachment_urls" JSONB,
    "location" VARCHAR(200),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "resolved_at" TIMESTAMP(3),
    "closed_at" TIMESTAMP(3),

    CONSTRAINT "complaints_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_comments" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "comment" TEXT NOT NULL,
    "is_internal" BOOLEAN NOT NULL DEFAULT false,
    "attachment_urls" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_comments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "complaint_status_history" (
    "id" TEXT NOT NULL,
    "complaint_id" TEXT NOT NULL,
    "changed_by" TEXT NOT NULL,
    "old_status" VARCHAR(50) NOT NULL,
    "new_status" VARCHAR(50) NOT NULL,
    "remarks" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "complaint_status_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yellow_pages" (
    "id" TEXT NOT NULL,
    "submitted_by" TEXT NOT NULL,
    "category" "ServiceCategory" NOT NULL,
    "service_provider_name" VARCHAR(100) NOT NULL,
    "contact_number" VARCHAR(15) NOT NULL,
    "alternate_contact" VARCHAR(15),
    "email" VARCHAR(100),
    "area_of_service" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "working_hours" VARCHAR(100),
    "service_charges" VARCHAR(100),
    "experience_years" INTEGER,
    "rating" DECIMAL(3,2) NOT NULL DEFAULT 0.00,
    "recommendation_note" TEXT,
    "visiting_card_url" TEXT,
    "status" "ApprovalStatus" NOT NULL DEFAULT 'PENDING',
    "approved_by" TEXT,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "yellow_pages_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "yellow_pages_reviews" (
    "id" TEXT NOT NULL,
    "yellow_page_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "review" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "yellow_pages_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "activity_logs" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "action" VARCHAR(100) NOT NULL,
    "entity_type" VARCHAR(50),
    "entity_id" TEXT,
    "details" JSONB,
    "ip_address" VARCHAR(45),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "activity_logs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "buildings_building_code_key" ON "buildings"("building_code");

-- CreateIndex
CREATE UNIQUE INDEX "flats_building_id_flat_number_key" ON "flats"("building_id", "flat_number");

-- CreateIndex
CREATE UNIQUE INDEX "event_registrations_event_id_user_id_key" ON "event_registrations"("event_id", "user_id");

-- CreateIndex
CREATE UNIQUE INDEX "vehicles_vehicle_number_key" ON "vehicles"("vehicle_number");

-- CreateIndex
CREATE UNIQUE INDEX "complaints_complaint_number_key" ON "complaints"("complaint_number");

-- CreateIndex
CREATE UNIQUE INDEX "yellow_pages_reviews_yellow_page_id_user_id_key" ON "yellow_pages_reviews"("yellow_page_id", "user_id");

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_flat_id_fkey" FOREIGN KEY ("flat_id") REFERENCES "flats"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "users" ADD CONSTRAINT "users_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flats" ADD CONSTRAINT "flats_building_id_fkey" FOREIGN KEY ("building_id") REFERENCES "buildings"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flats" ADD CONSTRAINT "flats_owner_id_fkey" FOREIGN KEY ("owner_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "flats" ADD CONSTRAINT "flats_current_tenant_id_fkey" FOREIGN KEY ("current_tenant_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "notices" ADD CONSTRAINT "notices_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "events" ADD CONSTRAINT "events_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_event_id_fkey" FOREIGN KEY ("event_id") REFERENCES "events"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "event_registrations" ADD CONSTRAINT "event_registrations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "marketplace_ads" ADD CONSTRAINT "marketplace_ads_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_to_fkey" FOREIGN KEY ("assigned_to") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaints" ADD CONSTRAINT "complaints_assigned_by_fkey" FOREIGN KEY ("assigned_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_comments" ADD CONSTRAINT "complaint_comments_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_comments" ADD CONSTRAINT "complaint_comments_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_complaint_id_fkey" FOREIGN KEY ("complaint_id") REFERENCES "complaints"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "complaint_status_history" ADD CONSTRAINT "complaint_status_history_changed_by_fkey" FOREIGN KEY ("changed_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yellow_pages" ADD CONSTRAINT "yellow_pages_submitted_by_fkey" FOREIGN KEY ("submitted_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yellow_pages" ADD CONSTRAINT "yellow_pages_approved_by_fkey" FOREIGN KEY ("approved_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yellow_pages_reviews" ADD CONSTRAINT "yellow_pages_reviews_yellow_page_id_fkey" FOREIGN KEY ("yellow_page_id") REFERENCES "yellow_pages"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "yellow_pages_reviews" ADD CONSTRAINT "yellow_pages_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "activity_logs" ADD CONSTRAINT "activity_logs_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
