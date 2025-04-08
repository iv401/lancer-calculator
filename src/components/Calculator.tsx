import React, { useState, useEffect } from 'react';
import { 
  Box, 
  TextField, 
  Slider, 
  Typography, 
  Card, 
  CardContent,
  Grid,
  Container,
  Tooltip,
  IconButton,
  Paper,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';

interface CalculatorData {
  totalJobs: number;
  analyzedJobs: number;
  suitableJobs: number;
  openedJobs: number;
  repliedJobs: number;
  wonJobs: number;
  earnings: number;
  savedConnects: number;
  savedTime: number;
  savedTimeValue: number;
  hourlyRate: number;
  averageProjectPrice: number;
  totalValue: number;
}

const PRICE_PER_LEAD = 0.80;
const PLANS = {
  STARTER: {
    name: 'Starter Plan',
    price: 250,
    leads: 500,
    description: 'Solo freelancers'
  },
  AGENCY: {
    name: 'Agency Plan',
    price: 1250,
    leads: 2500,
    description: 'Growing agencies'
  },
  EXPERT: {
    name: 'Lead Gen Expert',
    price: 'Custom',
    leads: 'Custom',
    description: 'Multi-client pros'
  },
  PAY_AS_YOU_GO: {
    name: 'Pay-As-You-Go',
    price: 'Flexible',
    leads: 'Flexible',
    description: 'Flexible users'
  }
};

const Calculator: React.FC = () => {
  const [keyword, setKeyword] = useState<string>('');
  const [coverage, setCoverage] = useState<number>(10);
  const [data, setData] = useState<CalculatorData>({
    totalJobs: 0,
    analyzedJobs: 0,
    suitableJobs: 0,
    openedJobs: 0,
    repliedJobs: 0,
    wonJobs: 0,
    earnings: 0,
    savedConnects: 0,
    savedTime: 0,
    savedTimeValue: 0,
    hourlyRate: 0,
    averageProjectPrice: 0,
    totalValue: 0
  });
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [userInput, setUserInput] = useState({
    hourlyRate: '',
    clientLTV: ''
  });
  const [isCalculatorEnabled, setIsCalculatorEnabled] = useState(false);

  const calculateMetrics = (totalJobs: number, coverage: number, hourlyRate: number, averageProjectPrice: number) => {
    const analyzedJobs = Math.floor(totalJobs * (coverage / 100));
    const suitableJobs = Math.floor(analyzedJobs * 0.1325);
    const openedJobs = Math.floor(suitableJobs * 0.6);
    const repliedJobs = Math.floor(openedJobs * 0.3);
    const wonJobs = Math.floor(repliedJobs * 0.3333);
    
    const earnings = wonJobs * averageProjectPrice;
    const savedConnects = (analyzedJobs - suitableJobs) * 3;
    const savedTime = analyzedJobs * 12; // in minutes
    
    const savedTimeValue = (savedTime / 60) * hourlyRate; // Convert minutes to hours and multiply by rate
    const totalValue = earnings + savedConnects + savedTimeValue;

    setData(prev => ({
      ...prev,
      analyzedJobs,
      suitableJobs,
      openedJobs,
      repliedJobs,
      wonJobs,
      earnings,
      savedConnects,
      savedTime,
      savedTimeValue,
      totalValue
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (keyword) {
      // Generate random total jobs between 100-3,000
      const totalJobs = Math.floor(Math.random() * (3000 - 100 + 1)) + 100;
      setData(prev => ({ ...prev, totalJobs }));
      setIsDialogOpen(true);
    }
  };

  const handleDialogClose = () => {
    setIsDialogOpen(false);
  };

  const handleDialogSubmit = () => {
    const hourlyRate = parseFloat(userInput.hourlyRate);
    const averageProjectPrice = parseFloat(userInput.clientLTV);
    
    if (!isNaN(hourlyRate) && !isNaN(averageProjectPrice) && hourlyRate > 0 && averageProjectPrice > 0) {
      setData(prev => ({ ...prev, hourlyRate, averageProjectPrice }));
      calculateMetrics(data.totalJobs, coverage, hourlyRate, averageProjectPrice);
      setIsCalculatorEnabled(true);
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    if (isCalculatorEnabled && data.totalJobs > 0) {
      calculateMetrics(data.totalJobs, coverage, data.hourlyRate, data.averageProjectPrice);
    }
  }, [coverage]);

  const formatNumber = (num: number): string => {
    return new Intl.NumberFormat('en-US').format(num);
  };

  const formatCurrency = (num: number): string => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(num);
  };

  const formatTime = (minutes: number): string => {
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 8);
    return `${days}d ${hours % 8}h`;
  };

  const MetricCard: React.FC<{
    title: string;
    value: string;
    tooltip: string;
    subtext?: string;
  }> = ({ title, value, tooltip, subtext }) => (
    <Card sx={{ 
      height: '100%',
      minHeight: '160px',
      width: '100%',
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'center',
      position: 'relative',
      bgcolor: 'background.paper',
      borderRadius: 2,
      boxShadow: 'none',
      border: '1px solid',
      borderColor: 'divider'
    }}>
      <CardContent>
        <Typography variant="h4" component="div" align="center" sx={{ mb: 1, color: 'primary.main' }}>
          {value}
        </Typography>
        <Typography color="text.secondary" align="center" sx={{ fontSize: '0.9rem', mb: 1 }}>
          {title}
        </Typography>
        {subtext && (
          <Tooltip title={tooltip}>
            <Typography 
              color="text.secondary" 
              align="center" 
              sx={{ 
                fontSize: '0.8rem',
                cursor: 'help',
                '&:hover': {
                  color: 'primary.main'
                }
              }}
            >
              {subtext}
            </Typography>
          </Tooltip>
        )}
      </CardContent>
    </Card>
  );

  const getRecommendedPlan = (leadsAnalyzed: number) => {
    if (leadsAnalyzed <= PLANS.STARTER.leads) {
      return PLANS.STARTER;
    } else if (leadsAnalyzed <= PLANS.AGENCY.leads) {
      return PLANS.AGENCY;
    } else {
      return PLANS.EXPERT;
    }
  };

  const calculatePricingMetrics = () => {
    const leadsAnalyzed = data.analyzedJobs;
    const recommendedPlan = getRecommendedPlan(leadsAnalyzed);
    const estMonthlyInvestment = leadsAnalyzed * PRICE_PER_LEAD;
    const estReturn = data.earnings;
    const roi = estReturn / estMonthlyInvestment;

    return {
      recommendedPlan,
      estMonthlyInvestment,
      estReturn,
      roi
    };
  };

  const pricingMetrics = calculatePricingMetrics();

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      <Box sx={{ mb: 8, textAlign: 'center' }}>
        <Typography variant="h3" component="h1" gutterBottom sx={{ fontWeight: 300 }}>
          Lancer Leads Calculator
        </Typography>
        
        <Paper 
          component="form" 
          onSubmit={handleSubmit} 
          sx={{ 
            p: 4,
            mb: 6,
            maxWidth: 600,
            mx: 'auto',
            bgcolor: 'background.paper',
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider'
          }}
        >
          <TextField
            fullWidth
            label="Enter Lead Keyword"
            variant="outlined"
            value={keyword}
            onChange={(e) => setKeyword(e.target.value)}
            sx={{ mb: 2 }}
          />
          {data.totalJobs > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, justifyContent: 'center' }}>
              <Tooltip title="A lead is each job that is posted on Upwork that matches your search criteria; we forecast the monthly number of leads based on how many such jobs are posted monthly.">
                <IconButton size="small">
                  <InfoIcon />
                </IconButton>
              </Tooltip>
              <Typography variant="body1" sx={{ color: 'text.secondary' }}>
                Monthly Forecast: {formatNumber(data.totalJobs)} leads
              </Typography>
            </Box>
          )}
        </Paper>

        <Box sx={{ 
          opacity: isCalculatorEnabled ? 1 : 0.5, 
          pointerEvents: isCalculatorEnabled ? 'auto' : 'none',
          transition: 'opacity 0.3s ease'
        }}>
          <Box sx={{ maxWidth: 400, mx: 'auto', mb: 6 }}>
            <Typography gutterBottom align="center" color="text.secondary">
              Coverage: {coverage}%
            </Typography>
            <Slider
              value={coverage}
              onChange={(_, value) => setCoverage(value as number)}
              min={0}
              max={100}
              step={1}
              sx={{ 
                '& .MuiSlider-thumb': {
                  bgcolor: 'background.paper',
                  borderWidth: 2
                }
              }}
            />
          </Box>

          <Typography variant="h5" sx={{ mb: 4, fontWeight: 300, textAlign: 'center' }}>
            Lead Funnel
          </Typography>
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              mb: 6,
              maxWidth: '1000px',
              mx: 'auto',
              justifyContent: 'center'
            }}
          >
            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Analyzed"
                value={formatNumber(data.analyzedJobs)}
                tooltip={`Based on our beta, this is the number of leads analyzed according to your coverage setting of ${coverage}%`}
                subtext={`${coverage}% coverage`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Suitable"
                value={formatNumber(data.suitableJobs)}
                tooltip="Based on our beta, on average 13.25% of analyzed leads match your criteria and are worth applying to"
                subtext="13.25% conversion"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Opened"
                value={formatNumber(data.openedJobs)}
                tooltip="Based on our beta, on average 60% of suitable leads result in clients opening your proposal"
                subtext="60% conversion"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Replied"
                value={formatNumber(data.repliedJobs)}
                tooltip="Based on our beta, on average 30% of opened proposals receive a client reply"
                subtext="30% conversion"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={2.4}>
              <MetricCard
                title="Won"
                value={formatNumber(data.wonJobs)}
                tooltip="Based on our beta, on average 33.33% of replied proposals convert to won projects"
                subtext="33.33% conversion"
              />
            </Grid>
          </Grid>

          <Typography variant="h5" sx={{ mb: 4, fontWeight: 300, textAlign: 'center' }}>
            Value Generated
          </Typography>
          <Grid 
            container 
            spacing={3} 
            sx={{ 
              maxWidth: '1200px',
              mx: 'auto',
              justifyContent: 'center'
            }}
          >
            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Won Deals Value"
                value={formatCurrency(data.earnings)}
                tooltip="Estimated earnings based on the average project value for leads in this category"
                subtext={`Avg. project: ${formatCurrency(data.averageProjectPrice)}`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Connects Saved"
                value={formatCurrency(data.savedConnects)}
                tooltip="Money saved by not spending connects on unsuitable leads (calculated at $3 per connect)"
                subtext="$3 per connect"
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title={`Time Saved`}
                value={formatTime(data.savedTime)}
                tooltip="Time saved by not writing proposals for unsuitable leads"
                subtext={`Value: ${formatCurrency(data.savedTimeValue)}`}
              />
            </Grid>

            <Grid item xs={12} sm={6} md={3}>
              <MetricCard
                title="Total Value"
                value={formatCurrency(data.totalValue)}
                tooltip="The total value Lancer would provide per month"
                subtext="All benefits combined"
              />
            </Grid>
          </Grid>
        </Box>

        {isCalculatorEnabled && (
          <Box sx={{ mt: 8 }}>
            <Card sx={{ 
              p: 4, 
              borderRadius: 2, 
              bgcolor: 'primary.main', 
              color: 'primary.contrastText',
              maxWidth: 800,
              mx: 'auto'
            }}>
              <Grid container spacing={3} alignItems="center" direction="column">
                <Grid item xs={12}>
                  <Typography variant="h5" gutterBottom sx={{ fontWeight: 300, textAlign: 'center' }}>
                    You're investing {formatCurrency(data.analyzedJobs * PRICE_PER_LEAD)} and we're projecting {formatCurrency(data.earnings)} returns.
                  </Typography>
                  <Typography variant="body1" sx={{ opacity: 0.9, textAlign: 'center', mb: 3 }}>
                    Pay only for what you use at {formatCurrency(PRICE_PER_LEAD)} per analyzed lead.
                  </Typography>
                </Grid>
                <Grid item>
                  <Button 
                    variant="contained" 
                    color="secondary" 
                    size="large"
                    sx={{
                      bgcolor: 'background.paper',
                      color: 'primary.main',
                      px: 4,
                      '&:hover': {
                        bgcolor: 'background.paper',
                        opacity: 0.9
                      }
                    }}
                  >
                    Get Started
                  </Button>
                </Grid>
              </Grid>
            </Card>
          </Box>
        )}
      </Box>

      <Dialog 
        open={isDialogOpen} 
        onClose={handleDialogClose}
        PaperProps={{
          sx: {
            borderRadius: 2,
            boxShadow: 'none',
            border: '1px solid',
            borderColor: 'divider'
          }
        }}
      >
        <DialogTitle sx={{ textAlign: 'center' }}>Enter Your Rates</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Your Hourly Rate ($)"
              type="number"
              value={userInput.hourlyRate}
              onChange={(e) => setUserInput(prev => ({ ...prev, hourlyRate: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Average Client LTV ($)"
              type="number"
              value={userInput.clientLTV}
              onChange={(e) => setUserInput(prev => ({ ...prev, clientLTV: e.target.value }))}
              fullWidth
              helperText="The average value of a client project"
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 3 }}>
          <Button onClick={handleDialogClose} sx={{ color: 'text.secondary' }}>
            Cancel
          </Button>
          <Button 
            onClick={handleDialogSubmit} 
            variant="contained" 
            sx={{ 
              minWidth: 100,
              '&:hover': {
                opacity: 0.9
              }
            }}
          >
            Calculate
          </Button>
        </DialogActions>
      </Dialog>
    </Container>
  );
};

export default Calculator; 