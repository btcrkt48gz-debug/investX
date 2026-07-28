import { useEffect, useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import { InvestmentProvider } from '@/context/InvestmentContext';
import { AuthProvider } from '@/context/AuthContext';
import NotFound from '@/pages/not-found';
import Home from '@/pages/Home';
import Portfolio from '@/pages/Portfolio';
import AssetDetail from '@/pages/AssetDetail';
import PlanDetail from '@/pages/PlanDetail';
import StocksPick from '@/pages/StocksPick';
import CryptoPick from '@/pages/CryptoPick';
import CryptoInvest from '@/pages/CryptoInvest';
import StocksInvest from '@/pages/StocksInvest';
import CommoditiesPick from '@/pages/CommoditiesPick';
import CommoditiesInvest from '@/pages/CommoditiesInvest';
import RealEstatePick from '@/pages/RealEstatePick';
import RealEstateInvest from '@/pages/RealEstateInvest';
import AddMoney from '@/pages/AddMoney';
import GiftCard from '@/pages/GiftCard';
import Withdraw from '@/pages/Withdraw';
import CryptoSelect from '@/pages/CryptoSelect';
import CoinDetail from '@/pages/CoinDetail';
import CoinReceive from '@/pages/CoinReceive';
import PyusdReceive from '@/pages/PyusdReceive';
import BankTransfer from '@/pages/BankTransfer';
import Profile from '@/pages/Profile';
import MyProfile from '@/pages/MyProfile';
import EditInvestXTag from '@/pages/EditInvestXTag';
import ChangePassword from '@/pages/ChangePassword';
import DeviceSession from '@/pages/DeviceSession';
import TalkToSupport from '@/pages/TalkToSupport';
import AdminLogin from '@/pages/AdminLogin';
import AdminDashboard from '@/pages/AdminDashboard';
import AdminUserDetail from '@/pages/AdminUserDetail';
import Send from '@/pages/Send';
import MarketChart from '@/pages/MarketChart';
import { InvestXLanding } from '@/pages/LandingPage';
import Login from '@/pages/Login';
import Signup from '@/pages/Signup';
import { StocksPage, ETFsPage, CryptoInfoPage, OptionsPage, MarginPage } from '@/pages/info/ProductPages';
import { Route, Switch, Router as WouterRouter, useLocation } from 'wouter';
import { SplashScreen } from '@/components/SplashScreen';

const queryClient = new QueryClient();

// Show splash once per page load
let _splashDone = false;

function ScrollToTop() {
  const [location] = useLocation();
  useEffect(() => { window.scrollTo(0, 0); }, [location]);
  return null;
}

function LandingWithSplash() {
  const [showSplash, setShowSplash] = useState(() => !_splashDone);
  const handleDone = () => { _splashDone = true; setShowSplash(false); };
  return (
    <>
      {showSplash && <SplashScreen onComplete={handleDone} />}
      <InvestXLanding />
    </>
  );
}

function Router() {
  return (
    <>
      <ScrollToTop />
      <Switch>
        <Route path="/" component={LandingWithSplash} />
        <Route path="/app" component={Home} />
        <Route path="/portfolio" component={Portfolio} />
        <Route path="/portfolio/:id" component={AssetDetail} />
        <Route path="/plan/:planId" component={PlanDetail} />
        <Route path="/plan/:planId/stocks" component={StocksPick} />
        <Route path="/plan/:planId/stocks/:ticker" component={StocksInvest} />
        <Route path="/plan/:planId/crypto" component={CryptoPick} />
        <Route path="/plan/:planId/crypto/:ticker" component={CryptoInvest} />
        <Route path="/plan/:planId/commodities" component={CommoditiesPick} />
        <Route path="/plan/:planId/commodities/:ticker" component={CommoditiesInvest} />
        <Route path="/plan/:planId/realestate" component={RealEstatePick} />
        <Route path="/plan/:planId/realestate/:ticker" component={RealEstateInvest} />
        <Route path="/add-money" component={AddMoney} />
        <Route path="/add-money/gift-card" component={GiftCard} />
        <Route path="/withdraw" component={Withdraw} />
        <Route path="/add-money/crypto" component={CryptoSelect} />
        <Route path="/add-money/crypto/:coin" component={CoinDetail} />
        <Route path="/add-money/crypto/:coin/receive" component={CoinReceive} />
        <Route path="/add-money/pyusd" component={PyusdReceive} />
        <Route path="/add-money/bank" component={BankTransfer} />
        <Route path="/profile" component={Profile} />
        <Route path="/profile/my-profile" component={MyProfile} />
        <Route path="/profile/my-profile/edit-tag" component={EditInvestXTag} />
        <Route path="/profile/change-password" component={ChangePassword} />
        <Route path="/profile/device-session" component={DeviceSession} />
        <Route path="/profile/support" component={TalkToSupport} />
        <Route path="/admin" component={AdminLogin} />
        <Route path="/admin/dashboard" component={AdminDashboard} />
        <Route path="/admin/users/:uid" component={AdminUserDetail} />
        <Route path="/send" component={Send} />
        <Route path="/market-chart/:name" component={MarketChart} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/products/stocks" component={StocksPage} />
        <Route path="/products/etfs" component={ETFsPage} />
        <Route path="/products/crypto" component={CryptoInfoPage} />
        <Route path="/products/options" component={OptionsPage} />
        <Route path="/products/margin" component={MarginPage} />
        <Route component={NotFound} />
      </Switch>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <TooltipProvider>
          <InvestmentProvider>
            <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
              <Router />
            </WouterRouter>
            <Toaster />
          </InvestmentProvider>
        </TooltipProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
