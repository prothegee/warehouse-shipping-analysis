import { Card, CardContent, Typography, Box } from "@mui/material";
import type { SvgIconComponent } from "@mui/icons-material";

interface StatCardProps {
  label: string;
  value: number;
  Icon: SvgIconComponent;
  color: string;
}

export default function StatCard({ label, value, Icon, color }: StatCardProps) {
  return (
    <Card variant="outlined" sx={{ flex: 1, minWidth: 140 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1, mb: 1 }}>
          <Icon sx={{ color }} fontSize="small" />
          <Typography variant="caption" color="text.secondary">
            {label}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{ fontWeight: "bold" }}
        >
          {value}
        </Typography>
      </CardContent>
    </Card>
  );
}
