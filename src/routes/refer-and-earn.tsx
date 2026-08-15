import { createFileRoute } from '@tanstack/react-router'

export const Route = createFileRoute('/refer-and-earn')({
  component: RouteComponent,
})

function RouteComponent() {
  return <div>Hello "/refer-and-earn"!</div>
}
