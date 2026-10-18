#!/usr/bin/env bash
set -euo pipefail

P=${GOOGLE_CLOUD_PROJECT:?set GOOGLE_CLOUD_PROJECT}
R=asia-southeast1

gcloud run deploy bonafide-api --source backend --region "$R" \
  --service-account "bonafide-api@$P.iam.gserviceaccount.com" --allow-unauthenticated \
  --no-cpu-throttling --min-instances 1 --max-instances 3 --cpu 1 --memory 2Gi \
  --timeout 300 --cpu-boost \
  --set-env-vars "GOOGLE_CLOUD_PROJECT=$P,GOOGLE_CLOUD_LOCATION=global,GOOGLE_GENAI_USE_VERTEXAI=true,BONAFIDE_REGION=$R,BONAFIDE_BUCKET=$P.firebasestorage.app,BONAFIDE_MODEL_MAIN=gemini-3.8-flash,BONAFIDE_MODEL_SMALL=gemini-3.5-flash-lite,BONAFIDE_MODEL_ARMOR_TEMPLATE=bonafide-input,BONAFIDE_DEMO_MODE=true,BONAFIDE_GROUNDING_MIN=0.6,BONAFIDE_SCHEDULER_SA=bonafide-scheduler@$P.iam.gserviceaccount.com"

URL=$(gcloud run services describe bonafide-api --region "$R" --format='value(status.url)')
gcloud run services update bonafide-api --region "$R" --update-env-vars "BONAFIDE_SERVICE_URL=$URL"

curl -sf "$URL/actuator/health" && echo
