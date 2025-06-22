import UserBlog from "@/components/UserBlog/UserBlog";

export default async function UserBlogPage({
  params,
}: {
  params: Promise<{ userId: string }>;
}) {
  // Server Component에서 params.userId를 파싱
  const { userId } = await params;
  return <UserBlog userId={userId} />;
}
