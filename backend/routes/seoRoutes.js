/**
 * SEO Routes
 * API endpoints for retrieving SEO metadata
 */

import express from "express";
import SEOService from "../services/seoService.js";
import CoursesModel from "../models/coursesModel.js";
import EventsModel from "../models/eventsModel.js";
import NewsModel from "../models/newsModel.js";
import TeachersModel from "../models/teachersModel.js";
import ArtistModel from "../models/artistModel.js";
import GalleryModel from "../models/galleryModel.js";
import OffersModel from "../models/offersModel.js";
import ActivitiesModel from "../models/activitiesModel.js";

const router = express.Router();

/**
 * GET /api/seo/meta/:type/:slug
 * Retrieve SEO metadata for a specific item
 * Types: course, event, news, teacher, artist, offer, activity, gallery
 */
router.get("/meta/:type/:slug", async (req, res) => {
  try {
    const { type, slug } = req.params;

    let item = null;

    // Fetch the item based on type
    switch (type) {
      case "course":
        item = await CoursesModel.getBySlug(slug);
        break;
      case "event":
        item = await EventsModel.getBySlug(slug);
        break;
      case "news":
        item = await NewsModel.getBySlug(slug);
        break;
      case "teacher":
        item = await TeachersModel.getBySlug(slug);
        break;
      case "artist":
        item = await ArtistModel.getBySlug(slug);
        break;
      case "offer":
        item = await OffersModel.getBySlug(slug);
        break;
      case "activity":
        item = await ActivitiesModel.getBySlug(slug);
        break;
      case "gallery":
        item = await GalleryModel.getBySlug(slug);
        break;
      default:
        return res.status(400).json({
          success: false,
          message: `Unknown type: ${type}`,
          validTypes: [
            "course",
            "event",
            "news",
            "teacher",
            "artist",
            "offer",
            "activity",
            "gallery",
          ],
        });
    }

    if (!item) {
      return res.status(404).json({
        success: false,
        message: `${type} with slug "${slug}" not found`,
      });
    }

    const seoData = SEOService.getDynamicSEO(type, item);
    const enhancedMeta = SEOService.enhanceMetaTags(seoData);
    const schema = SEOService.getSchema(type, item);

    res.json({
      success: true,
      data: {
        meta: enhancedMeta,
        schema: schema,
      },
    });
  } catch (error) {
    console.error("SEO Meta Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving SEO metadata",
      error: error.message,
    });
  }
});

/**
 * GET /api/seo/page/:page
 * Retrieve SEO metadata for a static page
 * Pages: home, about, courses, teachers, events, gallery, activities, news, artists, offers, register
 */
router.get("/page/:page", async (req, res) => {
  try {
    const { page } = req.params;

    const validPages = [
      "home",
      "about",
      "courses",
      "teachers",
      "events",
      "gallery",
      "activities",
      "news",
      "artists",
      "offers",
      "register",
    ];

    if (!validPages.includes(page)) {
      return res.status(400).json({
        success: false,
        message: `Unknown page: ${page}`,
        validPages: validPages,
      });
    }

    const seoData = SEOService.getStaticPageSEO(page);
    const enhancedMeta = SEOService.enhanceMetaTags(seoData);
    const schema = SEOService.getSchema("organization", null);

    res.json({
      success: true,
      data: {
        meta: enhancedMeta,
        schema: schema,
      },
    });
  } catch (error) {
    console.error("SEO Page Meta Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving page SEO metadata",
      error: error.message,
    });
  }
});

/**
 * GET /api/seo/organization
 * Retrieve organization schema
 */
router.get("/organization", (req, res) => {
  try {
    const schema = SEOService.getSchema("organization", null);

    res.json({
      success: true,
      data: {
        schema: schema,
      },
    });
  } catch (error) {
    console.error("Organization Schema Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving organization schema",
      error: error.message,
    });
  }
});

/**
 * POST /api/seo/breadcrumb
 * Generate breadcrumb schema
 * Body: { breadcrumbs: [{ name: "Home", url: "/" }, ...] }
 */
router.post("/breadcrumb", (req, res) => {
  try {
    const { breadcrumbs } = req.body;

    if (!Array.isArray(breadcrumbs)) {
      return res.status(400).json({
        success: false,
        message: "breadcrumbs must be an array",
      });
    }

    const schema = SEOService.getBreadcrumbSchema(breadcrumbs);

    res.json({
      success: true,
      data: {
        schema: schema,
      },
    });
  } catch (error) {
    console.error("Breadcrumb Schema Error:", error);
    res.status(500).json({
      success: false,
      message: "Error generating breadcrumb schema",
      error: error.message,
    });
  }
});

/**
 * GET /api/seo/config
 * Retrieve brand configuration
 */
router.get("/config", (req, res) => {
  try {
    const config = SEOService.getDefaultSEO();

    res.json({
      success: true,
      data: {
        config: config,
      },
    });
  } catch (error) {
    console.error("SEO Config Error:", error);
    res.status(500).json({
      success: false,
      message: "Error retrieving SEO configuration",
      error: error.message,
    });
  }
});

export default router;
