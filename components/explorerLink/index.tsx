export default function ExplorerLink({ url }: { url: string }) {
  return (
    <a target="_blank" href={url} rel="noreferrer">
      <p className="subtitle">View on Explorer</p>
    </a>
  )
}
