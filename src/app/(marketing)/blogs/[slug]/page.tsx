export default function BlogPostPage({ params }: { params: { slug: string } }) {
  return (
    <div>
      <h1>Blog Post: {params.slug}</h1>
      {/* Blog post content will go here */}
    </div>
  );
}


