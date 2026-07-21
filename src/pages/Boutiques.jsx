import { useState, useMemo } from "react";
import {
  Package,
  Plus,
  X,
  Check,
  Pencil,
  Warehouse,
  ChevronRight,
  ChevronLeft,
  AlertTriangle,
  Eye,
  EyeOff,
  Download,
} from "lucide-react";
import { COLORS } from "../theme";
import { fmt, uid } from "../lib/format";
import { getS, totalCostVal } from "../lib/engine";
import { exportStock } from "../lib/exports";
import { Card, Stat, FIn, Btn, PH } from "../components/ui";
