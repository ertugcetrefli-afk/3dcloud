import Header from './components/Header';
import Footer from './components/Footer';
import DynamicHomepage from './components/DynamicHomepage';

function App() {
  return (
    <div className="min-h-screen bg-slate-950">
      <Header />
      <main className="pt-16">
        <DynamicHomepage />
      </main>
      <Footer />
    </div>
  );
}

export default App;
