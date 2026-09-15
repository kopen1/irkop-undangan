import { useEffect, useState } from "react";
import { Eye, EyeOff, MessageSquareHeart, Trash2 } from "lucide-react";
import { deleteWish, listWishes, setWishVisibility } from "../../../lib/api";
import type { WishRow } from "../../../lib/types";
import { formatDateTime } from "../../../lib/utils";
import { useToast } from "../../../hooks/useToast";
import { Badge } from "../../../components/ui/Badge";
import { Button } from "../../../components/ui/Button";
import { Card, CardBody, CardHeader } from "../../../components/ui/Card";
import { EmptyState } from "../../../components/ui/EmptyState";
import { Spinner } from "../../../components/ui/Spinner";
import type { EditorTabProps } from "./types";

export default function EditorWishesTab({ invitation }: EditorTabProps) {
  const toast = useToast();
  const [rows, setRows] = useState<WishRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;
    listWishes(invitation.id)
      .then((data) => {
        if (active) setRows(data);
      })
      .catch((error) => toast.error((error as Error).message))
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, [invitation.id, toast]);

  const toggle = async (wish: WishRow) => {
    try {
      await setWishVisibility(wish.id, !wish.is_visible);
      setRows((current) =>
        current.map((row) => (row.id === wish.id ? { ...row, is_visible: !row.is_visible } : row)),
      );
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  const remove = async (wish: WishRow) => {
    try {
      await deleteWish(wish.id);
      setRows((current) => current.filter((row) => row.id !== wish.id));
      toast.success("Ucapan dihapus.");
    } catch (error) {
      toast.error((error as Error).message);
    }
  };

  return (
    <Card>
      <CardHeader
        title="Ucapan & doa"
        description="Sembunyikan ucapan yang tidak ingin ditampilkan di undangan."
      />
      <CardBody>
        {loading ? (
          <div className="flex justify-center py-8">
            <Spinner />
          </div>
        ) : rows.length === 0 ? (
          <EmptyState
            icon={MessageSquareHeart}
            title="Belum ada ucapan"
            description="Doa dan ucapan dari tamu akan muncul di sini."
          />
        ) : (
          <ul className="divide-y divide-slate-100">
            {rows.map((wish) => (
              <li key={wish.id} className="flex items-start gap-3 py-4">
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <p className="text-sm font-medium text-slate-800">{wish.guest_name}</p>
                    {!wish.is_visible ? <Badge tone="amber">Disembunyikan</Badge> : null}
                  </div>
                  <p className="mt-1 whitespace-pre-wrap text-sm text-slate-600">{wish.message}</p>
                  <p className="mt-1 text-xs text-slate-400">{formatDateTime(wish.created_at)}</p>
                </div>
                <div className="flex shrink-0 gap-1">
                  <Button
                    size="icon"
                    variant="outline"
                    onClick={() => toggle(wish)}
                    title={wish.is_visible ? "Sembunyikan" : "Tampilkan"}
                  >
                    {wish.is_visible ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </Button>
                  <Button size="icon" variant="ghost" onClick={() => remove(wish)} title="Hapus">
                    <Trash2 className="h-4 w-4 text-rose-500" />
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </CardBody>
    </Card>
  );
}
