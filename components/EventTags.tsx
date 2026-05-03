
const EventTags = ({ tags }: { tags: string[] }) => {
  return (
    <div className="flex flex-row gap-1.5 flex-wrap">
      {tags.map((tag, idx: number) => (
        <div className="pill" key={idx}>
          {tag}
        </div>
      ))}
    </div>
  );
};

export default EventTags


