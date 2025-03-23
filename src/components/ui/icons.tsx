import {
  AlertTriangle,
  CheckCircle,
  XCircle,
  Loader2,
  Loader
} from "lucide-react";

export type IconProps = React.HTMLAttributes<SVGElement>;

export const Icons = {
  spinner: Loader,
  loading: Loader2,
  checkCircle: CheckCircle,
  xCircle: XCircle,
  alertTriangle: AlertTriangle
}; 