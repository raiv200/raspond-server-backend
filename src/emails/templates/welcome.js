const { baseLayout } = require('../layouts/base');

function welcomeEmail({ name }) {
  return {
    subject: 'Welcome to Raspond! 🎉',
    html: baseLayout({
      title: 'Welcome to Raspond', preheader: 'Your account is ready.',
      body: `<h2>Welcome, ${name || 'there'}!</h2>
        <p>Your Raspond account is all set up. Start collaborating on RFP responses with your team.</p>
        <p style="text-align:center;margin-top:28px;"><a href="${process.env.FRONTEND_URL}/home" class="btn">Go to Dashboard</a></p>`,
    }),
  };
}
module.exports = { welcomeEmail };
