import React, { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import { CreditCard, CheckCircle } from 'lucide-react';
import axios from 'axios';
import Confetti from 'react-confetti';

const stripePromise = loadStripe('pk_live_51Ocz3aLkcPTy2rjPtXbNgTurl0FpoaxdeHOnj39RLvI68zkLR4mk8B2YfDCFm4ryAvn5VEzjjedkdNhoHUk3mXCX003XxUmXKj'); // Replace with your Stripe Publishable Key

function BillingSettings() {
  const [paymentMethods, setPaymentMethods] = useState([]);
  const [currentPlan, setCurrentPlan] = useState(null);
  const [plans, setPlans] = useState([
    { id: 'free', name: 'Free Plan', price: 0, features: ['Access to everything','Data scraper - 50/month','Email marketing - 50/month', 'Landing page builder - build 1 page but they cannot deploy' ] },
    { id: 'basic', name: 'Basic Plan', price: 10, features: ['Data scraper - first 40 free and the rest depending upon api charges', 'Email marketing - 2000 email a month', 'Landing page builder - 1 landing page with deploy' ] },
    { id: 'pro', name: 'Standard Plan', price: 29, features: ['Data scraper - first 40 free and the rest depending upon api charges', 'Email marketing - 5000 email a month', 'Landing page builder - 2 landing page with deploy'] },
    { id: 'premium', name: 'Enterprise Plan', price: 99, features: ['Data scraper - first 40 free and the rest depending upon api charges', 'Email marketing - 10k email a month', 'Landing page builder - 3 landing page with deploy' ] },
  ]);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(true);
const [showDeletePopup, setShowDeletePopup] = useState(false);
const [paymentMethodToDelete, setPaymentMethodToDelete] = useState(null);

// Fetch payment methods
useEffect(() => {
  const fetchPaymentMethods = async () => {
    try {
      const token = sessionStorage.getItem('token');
      const response = await axios.get('https://api.leadsavvyai.com/api/payment/get-payment-methods', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setPaymentMethods(response.data.paymentMethods);
    } catch (error) {
      console.error('Error fetching payment methods:', error);
      setMessage('Failed to fetch payment methods.');
    }
  };

  fetchPaymentMethods();
}, []);

// Add payment method
const handleAddPaymentMethod = async (e) => {
  e.preventDefault();

  if (!stripe || !elements) {
    setMessage('Stripe.js has not loaded yet.');
    return;
  }

  const cardElement = elements.getElement(CardElement);

  try {
    const { error, paymentMethod } = await stripe.createPaymentMethod({
      type: 'card',
      card: cardElement,
    });

    if (error) {
      setMessage(`Error: ${error.message}`);
      return;
    }

    const token = sessionStorage.getItem('token');
    const response = await axios.post(
      'https://api.leadsavvyai.com/api/payment/add-payment-method',
      { paymentMethodId: paymentMethod.id },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );

    setMessage(response.data.message);

    const updatedPaymentMethodsResponse = await axios.get('https://api.leadsavvyai.com/api/payment/get-payment-methods', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPaymentMethods(updatedPaymentMethodsResponse.data.paymentMethods);

    cardElement.clear();
  } catch (error) {
    console.error('Error adding payment method:', error);
    setMessage('Failed to add payment method.');
  }
};

// Delete payment method
const handleDeletePaymentMethod = async () => {
  if (!paymentMethodToDelete) return;

  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.delete(`https://api.leadsavvyai.com/api/payment/delete-payment-method/${paymentMethodToDelete}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    setMessage(response.data.message);

    const updatedPaymentMethodsResponse = await axios.get('https://api.leadsavvyai.com/api/payment/get-payment-methods', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPaymentMethods(updatedPaymentMethodsResponse.data.paymentMethods);

    setShowDeletePopup(false);
    setPaymentMethodToDelete(null);
  } catch (error) {
    console.error('Error deleting payment method:', error);
    setMessage('Failed to delete payment method.');
  }
};

// Set default payment method
const handleSetDefaultPaymentMethod = async (paymentMethodId) => {
  try {
    const token = sessionStorage.getItem('token');
    const response = await axios.post(
      'https://api.leadsavvyai.com/api/payment/set-default-payment-method',
      { paymentMethodId },
      {
        headers: { Authorization: `Bearer ${token}` },
      }
    );
    setMessage(response.data.message);

    const updatedPaymentMethodsResponse = await axios.get('https://api.leadsavvyai.com/api/payment/get-payment-methods', {
      headers: { Authorization: `Bearer ${token}` },
    });
    setPaymentMethods(updatedPaymentMethodsResponse.data.paymentMethods);
  } catch (error) {
    console.error('Error setting default payment method:', error);
    setMessage('Failed to set default payment method.');
  }
};



  useEffect(() => {
    const fetchBillingDetails = async () => {
      try {
        const token = sessionStorage.getItem('token');

        // Fetch payment methods
        const paymentMethodsResponse = await axios.get('https://api.leadsavvyai.com/api/payment/get-payment-methods', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setPaymentMethods(paymentMethodsResponse.data.paymentMethods);

        // Fetch current subscription plan
        const subscriptionResponse = await axios.get('https://api.leadsavvyai.com/api/user/subscription-plan', {
          headers: { Authorization: `Bearer ${token}` },
        });
        setCurrentPlan(subscriptionResponse.data);
      } catch (error) {
        console.error('Error fetching billing details:', error);
        setMessage('Failed to fetch billing details.');
      } finally {
        setLoading(false);
      }
    };

    fetchBillingDetails();
  }, []);

  const handleSelectPlan = (planId) => {
    if (planId === 'free') {
      toast.success('You are already on the Free Plan.');
      return;
    }
    setSelectedPlan(planId);
    setShowPaymentModal(true);
  };

  const handlePaymentSuccess = (successMessage) => {
    toast.success(successMessage);
    setShowPaymentModal(false);
    setSelectedPlan(null);
    setShowSuccessPopup(true);
    // Refresh subscription details
    const fetchCurrentPlan = async () => {
      const token = sessionStorage.getItem('token');
      const subscriptionResponse = await axios.get('https://api.leadsavvyai.com/api/user/subscription-plan', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setCurrentPlan(subscriptionResponse.data);
    };
    fetchCurrentPlan();
  };

  const handlePaymentError = (errorMessage) => {
    toast.error(errorMessage);
    setShowPaymentModal(false);
    setSelectedPlan(null);
  };

  if (loading) {
    return <p>Loading billing details...</p>;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold mb-6">Billing Dashboard</h2>

      {/* Subscription Plan Selection Section */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-xl font-semibold mb-4">Select a Subscription Plan</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {plans.map((plan) => {
            const isCurrentPlan = currentPlan && currentPlan.id === plan.id;
            return (
              <div
                key={plan.id}
                className={`p-4 border border-gray-700 rounded-lg ${
                  isCurrentPlan ? 'bg-gray-700' : 'bg-gray-800'
                }`}
              >
                <h4 className="text-lg font-semibold text-white">{plan.name}</h4>
                <p className="text-gray-400">${plan.price}/month</p>
                <ul className="mt-2 text-gray-400 text-sm space-y-1">
                  {plan.features.map((feature, index) => (
                    <li key={index}>- {feature}</li>
                  ))}
                </ul>
                <button
                  className={`mt-4 px-4 py-2 rounded-lg ${
                    isCurrentPlan
                      ? 'bg-green-600 text-white cursor-not-allowed'
                      : 'bg-indigo-600 text-white hover:bg-indigo-700'
                  }`}
                  onClick={() => handleSelectPlan(plan.id)}
                  disabled={isCurrentPlan}
                >
                  {isCurrentPlan ? 'Current Plan' : 'Select Plan'}
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* Payment Modal */}
      {showPaymentModal && (
        <PaymentModal
          selectedPlan={selectedPlan}
          onClose={() => setShowPaymentModal(false)}
          onSuccess={handlePaymentSuccess}
          onError={handlePaymentError}
        />
      )}

      {/* Success Popup */}
      {showSuccessPopup && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <Confetti />
          <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md text-center">
            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
            <h3 className="text-2xl font-bold text-white mb-4">Congratulations!</h3>
            <p className="text-gray-400 mb-6">You have successfully subscribed to this plan.</p>
            <button
              className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              onClick={() => setShowSuccessPopup(false)}
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function PaymentModal({ selectedPlan, onClose, onSuccess, onError }) {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [savedPaymentMethods, setSavedPaymentMethods] = useState([]);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [savePaymentMethod, setSavePaymentMethod] = useState(false);

  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        const response = await axios.get('https://api.leadsavvyai.com/api/payment/get-payment-methods', {
          headers: {
            Authorization: `Bearer ${sessionStorage.getItem('token')}`,
          },
        });

        if (response.status === 200) {
          setSavedPaymentMethods(response.data.paymentMethods || []);
        }
      } catch (error) {
        console.error('Error fetching payment methods:', error);
      }
    };

    fetchPaymentMethods();
  }, []);

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (selectedPaymentMethod) {
        // Use saved payment method
        const response = await axios.post(
          'https://api.leadsavvyai.com/api/payment/create-subscription',
          { planId: selectedPlan, paymentMethodId: selectedPaymentMethod },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          }
        );

        if (response.status === 200) {
          onSuccess(response.data.message || 'Subscription created successfully.');
        } else {
          onError(response.data.message || 'Subscription failed. Please try again.');
        }
      } else {
        // Use new card details
        const cardElement = elements.getElement(CardElement);
        const { paymentMethod, error } = await stripe.createPaymentMethod({
          type: 'card',
          card: cardElement,
        });

        if (error) {
          onError(error.message);
          setLoading(false);
          return;
        }

        if (savePaymentMethod) {
          // Save the payment method
          const token = sessionStorage.getItem('token');
          await axios.post(
            'https://api.leadsavvyai.com/api/payment/add-payment-method',
            { paymentMethodId: paymentMethod.id },
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
        }

        const response = await axios.post(
          'https://api.leadsavvyai.com/api/payment/create-subscription',
          { planId: selectedPlan, paymentMethodId: paymentMethod.id },
          {
            headers: {
              Authorization: `Bearer ${sessionStorage.getItem('token')}`,
            },
          }
        );

        if (response.status === 200) {
          onSuccess(response.data.message || 'Subscription created successfully.');
        } else {
          onError(response.data.message || 'Subscription failed. Please try again.');
        }
      }
    } catch (error) {
      console.error('Error processing payment:', error);
      onError('An error occurred while processing your payment. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-md">
        <h3 className="text-xl font-semibold text-white mb-4">Complete Your Payment</h3>
        <form onSubmit={handlePayment}>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Saved Payment Methods</h4>
            {savedPaymentMethods.length > 0 ? (
              savedPaymentMethods.map((method) => (
                <div key={method.id} className="flex items-center gap-4 mb-2">
                  <input
                    type="radio"
                    id={method.id}
                    name="paymentMethod"
                    value={method.id}
                    onChange={() => setSelectedPaymentMethod(method.id)}
                  />
                  <label htmlFor={method.id} className="text-white">
                    {method.brand} •••• {method.last4} (Expires {method.expMonth}/{method.expYear})
                  </label>
                </div>
              ))
            ) : (
              <p className="text-gray-400">No saved payment methods found.</p>
            )}
          </div>
          <div className="mb-4">
            <h4 className="text-lg font-semibold text-white mb-2">Add New Card</h4>
            <div className="p-4 border border-gray-700 rounded-lg">
              <CardElement />
            </div>
            <div className="mt-2">
              <label className="flex items-center text-white">
                <input
                  type="checkbox"
                  className="mr-2"
                  checked={savePaymentMethod}
                  onChange={(e) => setSavePaymentMethod(e.target.checked)}
                />
                Save this payment method for future use
              </label>
            </div>
          </div>
          <div className="flex justify-end gap-4">
            <button
              type="button"
              className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
              disabled={loading}
            >
              {loading ? 'Processing...' : 'Pay'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

const App = () => (
  <Elements stripe={stripePromise}>
    <BillingSettings />
  </Elements>
);

export default App;