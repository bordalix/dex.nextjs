import Trade from 'components/trade'
import Footer from 'components/footer'
import Header from 'components/header'

export default function Home() {
  return (
    <section className="hero has-background-black-bis is-fullheight">
      <Header />
      <Trade />
      <Footer />
    </section>
  )
}
