import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";

interface TopPost {
  title: string;
  slug: string;
  views: number;
  publishedAt: string;
}

interface TopPostsTableProps {
  posts: TopPost[];
}

export function TopPostsTable({ posts }: TopPostsTableProps) {
  return (
    <Card className="overflow-hidden">
      <div className="p-6 pb-0">
        <h3 className="text-lg font-semibold text-white">Top Posts</h3>
      </div>
      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-navy-700 bg-navy-800 text-left">
              <th className="whitespace-nowrap px-6 py-3 font-medium text-slate-400">
                #
              </th>
              <th className="whitespace-nowrap px-6 py-3 font-medium text-slate-400">
                Title
              </th>
              <th className="whitespace-nowrap px-6 py-3 text-right font-medium text-slate-400">
                Views
              </th>
              <th className="whitespace-nowrap px-6 py-3 font-medium text-slate-400">
                Published
              </th>
            </tr>
          </thead>
          <tbody>
            {posts.map((post, index) => (
              <tr
                key={post.slug}
                className="border-b border-navy-800 transition-colors hover:bg-navy-800"
              >
                <td className="whitespace-nowrap px-6 py-3 text-slate-500">
                  {index + 1}
                </td>
                <td className="max-w-[300px] truncate px-6 py-3 font-medium text-slate-300">
                  {post.title}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-right font-mono font-semibold text-neon">
                  {post.views.toLocaleString()}
                </td>
                <td className="whitespace-nowrap px-6 py-3 text-slate-400">
                  {formatDate(post.publishedAt)}
                </td>
              </tr>
            ))}
            {posts.length === 0 && (
              <tr>
                <td
                  colSpan={4}
                  className="px-6 py-8 text-center text-slate-500"
                >
                  No published posts yet.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Card>
  );
}
