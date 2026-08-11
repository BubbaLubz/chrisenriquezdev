// One project per inner lifecycle stage (see CLAUDE.md's scalability note on
// what changes if a stage ever needs more than one). Real content, pulled
// from resume + public GitHub repos — see the note on missing links below.

export const projects = [
  {
    id: 'cloud-music-analytics',
    title: 'Cloud Music Analytics Platform',
    company: 'Independent project',
    stageBadge: 'ingestion',
    description:[
      'Spotify wrapped, but for your entire listening history.',
      'An event-driven AWS pipeline ingesting 165k+ ListenBrainz listening events through Kafka, with 30-minute polling and at-least-once delivery guaranteed via offset-after-write commits. Checkpoint-based and Redis deduplication kept the 30-minute poll cycles from reprocessing anything already ingested. Terraform provisioned the infrastructure, including a 1GB-per-query Athena cost guardrail and a 90-day S3 lifecycle policy on raw data.',
    ],
    techStack: ['Python', 'AWS Lambda', 'Kafka', 'Athena', 'dbt', 'Grafana', 'Terraform'],
    links: {
      repo: 'https://github.com/BubbaLubz/spotify-enrichment-pipeline',
    },
    architecture: {
      nodes: [
        {
          id: 'listenbrainz',
          label: 'ListenBrainz API',
          category: 'Sources',
          col: 1,
          row: 2,
          description: "Public ListenBrainz REST API — the source of a user's listening history.",
        },
        {
          id: 'eventbridge',
          label: 'EventBridge Scheduler',
          category: 'Orchestration',
          col: 2,
          row: 1,
          description: 'AWS EventBridge cron rule that triggers the Ingestor Lambda every 30 minutes.',
        },
        {
          id: 'ingestor',
          label: 'Ingestor Lambda',
          category: 'Infra',
          col: 2,
          row: 2,
          description:
            'Container-image-deployed Lambda triggered every 30 minutes — pulls new listens, checks them against the dedupe store, and produces validated events to Kafka.',
        },
        {
          id: 'redis',
          label: 'Redis Dedupe Store',
          category: 'Cache',
          col: 2,
          row: 3,
          description:
            'ElastiCache Redis instance storing recently-seen listen IDs, so a listen already ingested in a prior poll cycle never gets reprocessed.',
        },
        {
          id: 'kafka',
          label: 'Confluent Cloud Kafka',
          category: 'Streaming',
          col: 3,
          row: 2,
          description:
            'Managed Confluent Cloud Kafka topic — a durable buffer between ingestion and processing, decoupling the two so either can fail independently without losing events.',
        },
        {
          id: 'consumer',
          label: 'Consumer Lambda',
          category: 'Compute',
          col: 4,
          row: 2,
          description: 'ZIP-deployed Lambda triggered by Kafka — drains the topic in 10-second micro-batches.',
        },
        {
          id: 's3',
          label: 'Hive-Partitioned S3',
          category: 'Storage',
          col: 5,
          row: 2,
          description:
            'S3 data lake storing newline-delimited JSON, Hive-partitioned by date so downstream queries can prune to just the partitions they need.',
        },
        {
          id: 'athena',
          label: 'Athena + Glue Catalog',
          category: 'Processing',
          col: 6,
          row: 2,
          description: 'Athena queries the S3 partitions schema-on-read, via a Glue Data Catalog table definition.',
        },
        {
          id: 'quicksight',
          label: 'Amazon QuickSight',
          category: 'Serving',
          col: 7,
          row: 2,
          description:
            'BI layer for listening data — dashboards covering top artists, tracks, and listening trends over time.',
        },
        {
          id: 'grafana',
          label: 'Grafana',
          category: 'Serving',
          col: 6,
          row: 3,
          description:
            'Grafana dashboards for pipeline observability — Lambda invocations, Kafka consumer lag, and other CloudWatch metrics.',
        },
      ],
      edges: [
        { from: 'listenbrainz', to: 'ingestor', label: 'poll listens' },
        { from: 'eventbridge', to: 'ingestor', label: 'every 30 min' },
        { from: 'ingestor', to: 'redis', label: 'seen-ID cache' },
        { from: 'ingestor', to: 'kafka', label: 'validated events' },
        { from: 'kafka', to: 'consumer', label: '10s micro-batch' },
        { from: 'consumer', to: 's3', label: 'NDJSON' },
        { from: 's3', to: 'athena', label: 'schema-on-read' },
        { from: 'athena', to: 'quicksight', label: 'SPICE refresh' },
        { from: 'athena', to: 'grafana', label: 'metrics scrape' },
      ],
    },
  },
  {
    id: 'sticksplit',
    title: 'CV Drumming Analytics Tool',
    company: 'KiroHacks 2026',
    stageBadge: 'serving',
    description:
      'A video data pipeline for drumming footage — ingesting videos, sampling frames with OpenCV, extracting 19 MediaPipe landmarks, and computing 6 biomechanical metrics per clip. Calibrating landmark thresholds across 10 test videos cut pose-signal saturation from 80% to 30% and corrected metric inflation by 85%. The whole thing runs as a Dockerized FastAPI microservice handling ingestion, landmark extraction, metric computation, Firestore writes, and Pydantic validation.',
    techStack: ['Python', 'FastAPI', 'MediaPipe', 'OpenCV', 'Firebase Firestore', 'Docker'],
    links: {},
  },
  {
    id: 'data-infrastructure-diagram-tool',
    title: 'AI Data Infrastructure Diagram Tool',
    company: 'Independent project',
    stageBadge: 'storage',
    description:
      [ 'A study on data engineering system design.',
        'An AI infrastructure diagramming tool that converts Claude-generated JSON into Dagre-computed ReactFlow graphs, across a 37-component system spanning 11 infrastructure categories. Replacing full ReactFlow object serialization with minimal node/edge schemas cut edit-mode payload size by 40% and input tokens by 34%. Ambiguous infrastructure prompts get flagged with 100% accuracy on a 20-prompt test set, with a user-triggered best-effort fallback so a bad prompt never traps someone in a clarification loop.',
      ],
        techStack: ['TypeScript', 'React', 'ReactFlow', 'Dagre', 'Anthropic API', 'Supabase'],
    links: {
      repo: 'https://github.com/BubbaLubz/DEDiagram',
    },
  },
  {
    id: 'pfas-reporting-layer',
    title: 'PFAS Sample Analytics Pipeline',
    company: 'EKI Environment and Water Inc., Jan 2026 — Jun 2026',
    stageBadge: 'transformation',
    description: [
      "Nationwide sample analysis on man-made carcineogens.",
      "Built a data integration and standardization pipeline that ingests messy, inconsistent PFAS water-quality datasets from federal and state agencies and normalizes them at scale — resolving 1M+ records through a documented nine-stage workflow that maps everything into a canonical relational schema across four tables (chemical, location, sample, sample_source), normalizing analytes, dates, units, locations, and QA findings along the way. OpenAI and Anthropic APIs powered non-detect identification and QA validation within the workflow, taking non-detect identification from 0% to 81% and cutting QA false positives by 53%.",
      "The pipeline's outputs feed a normalized MySQL data model and SQL reporting layer, plus standardized CSV/Excel exports and an optional DuckDB-backed database — powering Power BI, Tableau, and Streamlit dashboards for California PFAS trend analysis, built while leading a 5-person team on the Dockerized standardization tool.",
      'Presented the final product to an audience of divisional vice presidents, senior water engineers, project directors, and club members before handing it off to EKI.',
    ],
    techStack: ['SQL', 'MySQL', 'DuckDB', 'OpenAI API', 'Anthropic API', 'Power BI', 'Tableau', 'Streamlit'],
    links: {},
    architecture: {
      // row 4 is the main spine; rows 1-3 stack alternate/fallback sources
      // above a spine step, row 5 holds the orchestration + load branch
      // below it — same "hand-placed grid" convention as Cloud Music's
      // diagram, just taller since more stages here have real fallbacks.
      nodes: [
        {
          id: 'raw-files',
          label: 'Raw PFAS Files',
          category: 'Sources',
          col: 1,
          row: 4,
          description: 'Accepts CSV, Excel, or JSON uploads of raw PFAS water-quality files from state and federal agencies.',
        },
        {
          id: 'column-mapping',
          label: 'Fuzzy Column Mapping',
          category: 'Processing',
          col: 2,
          row: 4,
          description:
            'Detects file encoding and header structure, then fuzzy-matches raw columns (token-sort ratio, Jaro-Winkler) to the canonical schema.',
        },
        {
          id: 'claude',
          label: 'Claude — Ambiguous Columns',
          category: 'AI/LLM',
          col: 2,
          row: 3,
          description:
            "Invoked only when fuzzy-match confidence falls below threshold — uses Anthropic Claude to resolve ambiguous column mappings.",
        },
        {
          id: 'openai',
          label: 'OpenAI — Fallback',
          category: 'AI/LLM',
          col: 2,
          row: 2,
          description: "Secondary AI fallback for column mappings Claude can't resolve confidently.",
        },
        {
          id: 'analyte-resolver',
          label: 'Analyte Resolver',
          category: 'Processing',
          col: 3,
          row: 4,
          description: 'Resolves analyte names against a local chemical reference table and synonym cache.',
        },
        {
          id: 'epa-comptox',
          label: 'EPA CompTox API',
          category: 'Sources',
          col: 3,
          row: 3,
          description: "Authoritative chemical identity enrichment for analytes the local reference can't resolve.",
        },
        {
          id: 'pubchem',
          label: 'PubChem PUG REST',
          category: 'Sources',
          col: 3,
          row: 2,
          description: 'Supplemental chemical mapping for analytes still unresolved after CompTox.',
        },
        {
          id: 'unit-normalizer',
          label: 'Unit Normalizer',
          category: 'Processing',
          col: 4,
          row: 4,
          description: 'Converts all concentration units to ng/L, standardizes non-detect flags, and parses dates to ISO 8601.',
        },
        {
          id: 'location-standardizer',
          label: 'Location Standardizer',
          category: 'Processing',
          col: 5,
          row: 4,
          description:
            'Merges geocoding and PWSID validation results, deriving a precision level and coordinate confidence for each record.',
        },
        {
          id: 'epa-sdwis',
          label: 'EPA SDWIS — PWSID',
          category: 'Sources',
          col: 5,
          row: 3,
          description: "Validates Public Water System IDs against EPA's Safe Drinking Water Information System.",
        },
        {
          id: 'census-geocoder',
          label: 'US Census Geocoder',
          category: 'Sources',
          col: 5,
          row: 2,
          description: 'Primary geocoding layer — batch-submits addresses via the Census Gazetteer lookup.',
        },
        {
          id: 'nominatim',
          label: 'Nominatim (OSM)',
          category: 'Sources',
          col: 5,
          row: 1,
          description: "Fallback geocoder for addresses or place names the Census batch lookup can't resolve.",
        },
        {
          id: 'qa-flag-engine',
          label: 'QA Flag Engine',
          category: 'Processing',
          col: 6,
          row: 4,
          description: 'Applies rule-based QA flags — negative results, missing detection limits, unresolved analytes, and duplicates.',
        },
        {
          id: 'pipeline-orchestration',
          label: 'Pipeline Orchestration',
          category: 'Orchestration',
          col: 6,
          row: 5,
          description: 'Schedules and sequences every stage of the pipeline, from ingestion through the final database load.',
        },
        {
          id: 'canonical-split',
          label: 'Canonical Schema Split',
          category: 'Storage',
          col: 7,
          row: 4,
          description:
            'Splits the fully standardized, QA-flagged row set into four relational outputs: chemical, location, sample, and sample_source.',
        },
        {
          id: 'csv-excel-artifacts',
          label: 'CSV / Excel Artifacts',
          category: 'Storage',
          col: 8,
          row: 4,
          description: 'Writes the final canonical CSV or Excel files for each of the four relational tables.',
        },
        {
          id: 'qa-report',
          label: 'QA Report Generator',
          category: 'Processing',
          col: 8,
          row: 3,
          description: 'Produces a multi-sheet Excel QA workbook summarizing every flag raised during standardization.',
        },
        {
          id: 'duckdb-loader',
          label: 'DuckDB Loader',
          category: 'Storage',
          col: 8,
          row: 5,
          description: 'Optionally bulk-loads all four canonical relational tables into a DuckDB database.',
        },
        {
          id: 'dashboard-layer',
          label: 'Dashboard Layer',
          category: 'Serving',
          col: 9,
          row: 5,
          description: 'Connects to DuckDB for interactive PFAS trend dashboards, built in Streamlit.',
        },
      ],
      // Edge labels: keep every individual token to ~7 characters or fewer.
      // The connector cell wraps between words but never mid-word, so one
      // long token (not the label's total word count) is what actually
      // overflows the fixed-width cell and crowds the neighboring nodes.
      // Where a token would run long, drop it if the node it points at
      // already implies it (e.g. "Nominatim (OSM)" doesn't need "OSM"
      // repeated on the edge feeding it).
      edges: [
        { from: 'raw-files', to: 'column-mapping', label: 'raw file bytes' },
        { from: 'column-mapping', to: 'claude', label: 'low match' },
        { from: 'claude', to: 'openai', label: 'still unclear' },
        { from: 'column-mapping', to: 'analyte-resolver', label: 'mapped frame' },
        { from: 'analyte-resolver', to: 'epa-comptox', label: 'no match' },
        { from: 'epa-comptox', to: 'pubchem', label: 'still missing' },
        { from: 'analyte-resolver', to: 'unit-normalizer', label: 'analyte map' },
        { from: 'unit-normalizer', to: 'location-standardizer', label: 'clean rows' },
        { from: 'location-standardizer', to: 'epa-sdwis', label: 'check PWSID' },
        { from: 'epa-sdwis', to: 'census-geocoder', label: 'geocode address' },
        { from: 'census-geocoder', to: 'nominatim', label: 'no match' },
        { from: 'location-standardizer', to: 'qa-flag-engine', label: 'geo rows' },
        { from: 'qa-flag-engine', to: 'pipeline-orchestration', label: 'all stages' },
        { from: 'qa-flag-engine', to: 'canonical-split', label: 'QA-flagged rows' },
        { from: 'canonical-split', to: 'csv-excel-artifacts', label: '4 tables' },
        { from: 'csv-excel-artifacts', to: 'qa-report', label: 'QA sheet' },
        { from: 'csv-excel-artifacts', to: 'duckdb-loader', label: 'bulk load' },
        { from: 'duckdb-loader', to: 'dashboard-layer', label: 'SQL query' },
      ],
    },
  },
]

export const stageBadgeConfig = {
  ingestion: { label: 'Ingestion' },
  transformation: { label: 'Transformation' },
  storage: { label: 'Storage' },
  serving: { label: 'Serving' },
}

export function getProjectById(id) {
  return projects.find((p) => p.id === id)
}

// Returns an array — even though today it's always length 1 per stage. If a
// stage ever gets a second project, the click behavior should branch here
// (open a short list instead of navigating straight to projects[0]) rather
// than requiring a rewrite. See CLAUDE.md's scalability note.
export function getProjectsByStage(stage) {
  return projects.filter((p) => p.stageBadge === stage)
}
