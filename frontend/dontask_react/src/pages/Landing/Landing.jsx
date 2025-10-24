import Background from "./components/Background/Background";
import Header from "./components/Header/Header";
import StartWork from "./components/StartWork/StartWork";
import Description from "./components/Description/Description";
import Steps from "./components/Steps/Steps";
import Demo from "./components/Demo/Demo";
import Footer from "./components/Footer/Footer";
import "../../fonts/fonts.css";

export default function Landing() {
  return (
    <>
      <Background>
        <Header />
        <StartWork />
      </Background>
      <Description />
      <Steps />
      <Demo />
      <Footer />
    </>
  );
}
