import UserBlog from "@/components/UserBlog/UserBlog";

interface UserBlogPageProps {
  params: { userId: string };
}

export default function UserBlogPage({ params }: UserBlogPageProps) {
  // Server Component에서 params.userId를 파싱
  const { userId } = params;
  return <UserBlog userId={userId} />;
}
