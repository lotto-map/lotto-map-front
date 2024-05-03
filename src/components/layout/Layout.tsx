import styled from 'styled-components';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children }: { children: React.ReactNode }) => {
  return (
    <LayoutStyle>
      <Header />
      <MainBoxStyle>{children}</MainBoxStyle>
      <Footer />
    </LayoutStyle>
  );
};

const LayoutStyle = styled.div`
  width: 100%;
  margin: 0 auto;
  max-width: 1400px;
`;

const MainBoxStyle = styled.div`
  width: 100%;
  height: 100vh;
`;

export default Layout;
