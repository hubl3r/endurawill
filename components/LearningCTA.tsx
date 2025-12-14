import Link from 'next/link';

export default function LearningCTA() {
  return (
    <section className="mt-12 rounded-xl border border-blue-200 bg-blue-50 p-6">
      <h3 className="text-lg font-semibold text-gray-900 mb-2">
        Have questions about your estate plan?
      </h3>

      <p className="text-gray-700 mb-4">
        Estate planning laws vary by state and individual circumstances.
        Speaking with a qualified professional can help clarify your options
        and ensure your documents reflect your intentions.
      </p>

      <Link
        href="/contact"
        className="inline-block rounded-lg bg-blue-600 px-5 py-3 text-white font-semibold hover:bg-blue-700"
      >
        Schedule a Consultation
      </Link>
    </section>
  );
}
