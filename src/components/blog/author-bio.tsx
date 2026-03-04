interface AuthorBioProps {
  author: {
    name: string;
    headshot?: string | null;
    jobTitle?: string | null;
    bio?: string | null;
  };
}

export function AuthorBio({ author }: AuthorBioProps) {
  const initials = author.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="rounded-lg bg-navy-800 p-6 my-8">
      <div className="flex items-start gap-4">
        {author.headshot ? (
          <img
            src={author.headshot}
            alt={author.name}
            className="h-16 w-16 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-navy-700 text-lg font-bold text-neon">
            {initials}
          </div>
        )}

        <div className="min-w-0">
          <h3 className="text-lg font-semibold text-white">{author.name}</h3>
          {author.jobTitle && (
            <p className="text-sm text-neon">{author.jobTitle}</p>
          )}
          {author.bio && (
            <p className="mt-2 text-sm text-slate-400 leading-relaxed">
              {author.bio}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
