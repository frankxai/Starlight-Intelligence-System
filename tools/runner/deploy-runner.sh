#!/usr/bin/env bash
# ==============================================================================
# Deploy Starlight Runner to Google Cloud Run Jobs (Scale-to-Zero)
# Built on SIP v1.1.1 — Sovereign Substrate
# ==============================================================================

set -eo pipefail

PROJECT_ID="${GCP_PROJECT_ID:-$(gcloud config get-value project 2>/dev/null || echo "")}"
REGION="${GCP_REGION:-us-central1}"
JOB_NAME="starlight-runner"
IMAGE_TAG="${REGION}-docker.pkg.dev/${PROJECT_ID}/starlight-fleet/runner:latest"

if [ -z "$PROJECT_ID" ]; then
  echo "Error: GCP Project ID not found. Set GCP_PROJECT_ID or run 'gcloud config set project <id>'."
  exit 1
fi

echo "Deploying Starlight Runner Job..."
echo "Project: $PROJECT_ID"
echo "Region:  $REGION"
echo "Image:   $IMAGE_TAG"

# 1. Enable required APIs
gcloud services enable run.googleapis.com artifactregistry.googleapis.com cloudbuild.googleapis.com --project="$PROJECT_ID"

# 2. Create Artifact Registry repository if not exists
gcloud artifacts repositories describe starlight-fleet --location="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1 || \
gcloud artifacts repositories create starlight-fleet \
  --repository-format=docker \
  --location="$REGION" \
  --description="Starlight Swarm Autonomous Runner Images" \
  --project="$PROJECT_ID"

# 3. Build container image using Cloud Build
echo "Building container with Cloud Build..."
gcloud builds submit . \
  --tag="$IMAGE_TAG" \
  --project="$PROJECT_ID"

# 4. Provision dedicated zero-project-IAM service account (never use default Compute Engine SA)
RUNNER_SA_NAME="${RUNNER_SA_NAME:-starlight-runner-sandbox}"
RUNNER_SA="${RUNNER_SERVICE_ACCOUNT:-${RUNNER_SA_NAME}@${PROJECT_ID}.iam.gserviceaccount.com}"
if ! gcloud iam service-accounts describe "$RUNNER_SA" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo " Creating least-privilege runner service account: $RUNNER_SA..."
  gcloud iam service-accounts create "$RUNNER_SA_NAME" \
    --display-name="Starlight Ephemeral Runner Sandbox (Zero Project IAM)" \
    --description="Isolated Cloud Run Jobs identity with zero project-wide IAM roles" \
    --project="$PROJECT_ID"
fi

# 5. Optional read-only Cloud Storage FUSE Volume for Dependency Seed Cache
VOLUME_ARGS=()
CACHE_BUCKET="${GCS_CACHE_BUCKET:-${PROJECT_ID}-starlight-runner-cache}"

if gcloud storage buckets describe "gs://${CACHE_BUCKET}" --project="$PROJECT_ID" >/dev/null 2>&1; then
  echo " Attaching read-only Cloud Storage cache volume from gs://${CACHE_BUCKET}..."
  gcloud storage buckets add-iam-policy-binding "gs://${CACHE_BUCKET}" \
    --member="serviceAccount:${RUNNER_SA}" \
    --role="roles/storage.objectViewer" \
    --project="$PROJECT_ID" >/dev/null
  VOLUME_ARGS+=(
    --add-volume="name=pnpm-cache,type=cloud-storage,bucket=${CACHE_BUCKET}"
    --add-volume-mount="volume=pnpm-cache,mount-path=/cache/pnpm,readonly=true"
  )
else
  echo " Note: Persistent cache bucket gs://${CACHE_BUCKET} not detected. (Runner will use image-baked store)."
  echo " To enable persistent FUSE cache across runs: gcloud storage buckets create gs://${CACHE_BUCKET} --location=${REGION}"
fi

# 6. Create or Update Cloud Run Job (Gen2 + dedicated least-privilege service account)
echo "Configuring Cloud Run Job: $JOB_NAME (Scale-to-Zero, 4GB RAM, 2 vCPUs, SA=$RUNNER_SA)..."
if gcloud run jobs describe "$JOB_NAME" --region="$REGION" --project="$PROJECT_ID" >/dev/null 2>&1; then
  gcloud run jobs update "$JOB_NAME" \
    --image="$IMAGE_TAG" \
    --region="$REGION" \
    --service-account="$RUNNER_SA" \
    --execution-environment=gen2 \
    --cpu=2 \
    --memory=4Gi \
    --task-timeout=900s \
    --max-retries=1 \
    "${VOLUME_ARGS[@]}" \
    --project="$PROJECT_ID"
else
  gcloud run jobs create "$JOB_NAME" \
    --image="$IMAGE_TAG" \
    --region="$REGION" \
    --service-account="$RUNNER_SA" \
    --execution-environment=gen2 \
    --cpu=2 \
    --memory=4Gi \
    --task-timeout=900s \
    --max-retries=1 \
    "${VOLUME_ARGS[@]}" \
    --project="$PROJECT_ID"
fi


echo "=========================================================="
echo " Starlight Runner Deployed Successfully!"
echo " Scale-to-Zero: $0.00 Idle Cost"
echo " Free Tier: Up to 360,000 vCPU-seconds / month"
echo " To execute on-demand:"
echo "   gcloud run jobs execute $JOB_NAME --region=$REGION --update-env-vars STARLIGHT_REPO=\"frankxai/arcanea-ai-app\",STARLIGHT_COMMAND=\"npm test\""
echo "=========================================================="
