"use client";

import { useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Loader2, FileText, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { GroupHeader } from "@/components/worker/groups/group-header";
import { GroupPostCard } from "@/components/worker/groups/group-post";
import { GroupMembers } from "@/components/worker/groups/group-members";
import {
  createGroupPost,
  getGroupPosts,
  type Group,
  type GroupPost,
  type GroupMember,
} from "@/lib/actions/groups";
import { toast } from "sonner";

interface GroupDetailClientProps {
  group: Group;
  initialPosts: GroupPost[];
  initialCursor: string | null;
  members: GroupMember[];
}

export function GroupDetailClient({
  group: initialGroup,
  initialPosts,
  initialCursor,
  members,
}: GroupDetailClientProps) {
  const [group, setGroup] = useState<Group>(initialGroup);
  const [posts, setPosts] = useState<GroupPost[]>(initialPosts);
  const [cursor, setCursor] = useState<string | null>(initialCursor);
  const [loadingMore, setLoadingMore] = useState(false);
  const [composerContent, setComposerContent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleJoinLeave = useCallback((isMember: boolean) => {
    setGroup((prev) => ({ ...prev, is_member: isMember }));
  }, []);

  const handleLoadMore = useCallback(async () => {
    if (!cursor || loadingMore) return;
    setLoadingMore(true);
    try {
      const { posts: more, nextCursor } = await getGroupPosts(group.id, cursor);
      setPosts((prev) => [...prev, ...more]);
      setCursor(nextCursor);
    } catch {
      toast.error("Error al cargar más publicaciones");
    } finally {
      setLoadingMore(false);
    }
  }, [cursor, loadingMore, group.id]);

  const handleSubmitPost = useCallback(async () => {
    const content = composerContent.trim();
    if (!content) return;
    setSubmitting(true);
    try {
      const newPost = await createGroupPost({
        group_id: group.id,
        content,
      });
      setPosts((prev) => [newPost, ...prev]);
      setComposerContent("");
      toast.success("Publicación creada");
    } catch {
      toast.error("Error al publicar");
    } finally {
      setSubmitting(false);
    }
  }, [composerContent, group.id]);

  const createdDate = new Date(group.created_at).toLocaleDateString("es-ES", {
    month: "long",
    year: "numeric",
  });

  const categoryLabels: Record<string, string> = {
    sector: "Sector profesional",
    country: "País",
    interest: "Interés",
  };

  return (
    <div className="flex flex-col gap-6">
      <GroupHeader group={group} onJoinLeave={handleJoinLeave} />

      <Tabs defaultValue="posts" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="posts" className="gap-2">
            <FileText className="size-4" />
            Publicaciones
          </TabsTrigger>
          <TabsTrigger value="members" className="gap-2">
            <Users className="size-4" />
            Miembros
            <span className="ml-1 rounded-full bg-muted px-1.5 py-0.5 text-xs font-medium">
              {group.member_count}
            </span>
          </TabsTrigger>
          <TabsTrigger value="info" className="gap-2">
            <Info className="size-4" />
            Info
          </TabsTrigger>
        </TabsList>

        {/* Posts tab */}
        <TabsContent value="posts">
          <div className="flex flex-col gap-4 max-w-2xl">
            {/* Composer — only for members */}
            {group.is_member && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-border bg-card p-4 shadow-sm"
              >
                <Textarea
                  placeholder="Comparte algo con el grupo..."
                  value={composerContent}
                  onChange={(e) => setComposerContent(e.target.value)}
                  className="mb-3 min-h-[80px] resize-none border-0 bg-transparent p-0 text-sm placeholder:text-muted-foreground focus-visible:ring-0"
                />
                <div className="flex justify-end">
                  <Button
                    size="sm"
                    onClick={handleSubmitPost}
                    disabled={submitting || !composerContent.trim()}
                  >
                    {submitting ? (
                      <Loader2 className="mr-2 size-4 animate-spin" />
                    ) : null}
                    Publicar
                  </Button>
                </div>
              </motion.div>
            )}

            {/* Posts list */}
            <AnimatePresence mode="popLayout">
              {posts.length === 0 ? (
                <motion.div
                  key="empty"
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className="rounded-xl border border-dashed border-border bg-card p-12 text-center text-muted-foreground"
                >
                  <FileText className="mx-auto mb-3 size-10 opacity-40" />
                  <p className="font-medium">Aún no hay publicaciones</p>
                  {group.is_member && (
                    <p className="mt-1 text-sm">¡Sé el primero en publicar!</p>
                  )}
                </motion.div>
              ) : (
                posts.map((post, i) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.98 }}
                    transition={{
                      type: "spring",
                      stiffness: 300,
                      damping: 28,
                      delay: Math.min(i * 0.04, 0.3),
                    }}
                  >
                    <GroupPostCard post={post} />
                  </motion.div>
                ))
              )}
            </AnimatePresence>

            {/* Load more */}
            {cursor && (
              <div className="flex justify-center pb-4">
                <Button
                  variant="outline"
                  onClick={handleLoadMore}
                  disabled={loadingMore}
                  className="min-w-40"
                >
                  {loadingMore ? (
                    <>
                      <Loader2 className="mr-2 size-4 animate-spin" />
                      Cargando...
                    </>
                  ) : (
                    "Cargar más"
                  )}
                </Button>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Members tab */}
        <TabsContent value="members">
          <GroupMembers members={members} />
        </TabsContent>

        {/* Info tab */}
        <TabsContent value="info">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-2xl rounded-xl border border-border bg-card p-6 shadow-sm"
          >
            <div className="flex flex-col gap-5">
              {group.description && (
                <div>
                  <h3 className="mb-1.5 font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                    Descripción
                  </h3>
                  <p className="text-sm leading-relaxed text-foreground">
                    {group.description}
                  </p>
                </div>
              )}
              <div>
                <h3 className="mb-1.5 font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Categoría
                </h3>
                <span className="inline-flex items-center rounded-full bg-brand-100 px-3 py-1 text-sm font-medium text-brand-700">
                  {categoryLabels[group.category] ?? group.category}
                </span>
              </div>
              <div>
                <h3 className="mb-1.5 font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Visibilidad
                </h3>
                <p className="text-sm text-foreground">
                  {group.is_public ? "Grupo público" : "Grupo privado"}
                </p>
              </div>
              <div>
                <h3 className="mb-1.5 font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Creado en
                </h3>
                <p className="text-sm text-foreground">{createdDate}</p>
              </div>
              <div>
                <h3 className="mb-1.5 font-heading text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Miembros
                </h3>
                <p className="text-sm text-foreground">
                  {group.member_count} miembro{group.member_count !== 1 ? "s" : ""}
                </p>
              </div>
            </div>
          </motion.div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
